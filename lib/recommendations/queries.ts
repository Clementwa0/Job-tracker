import { and, desc, eq, gt, isNull, ne, notExists, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { companies, jobPostings, jobs } from "@/lib/db/schema";
import { buildCandidateSignals } from "@/lib/profile/context";
import { loadJobseekerContext } from "@/lib/profile/queries";
import { scorePosting } from "@/lib/recommendations/scoring";
import type { RecommendationsResponse, RecommendedJob } from "@/types/profile";

/** Below this the "match" is mostly coincidence, so don't recommend it. */
export const MIN_MATCH_SCORE = 30;
/** How many of the newest open postings are scored per request. */
const CANDIDATE_POOL = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Personalised job recommendations for a jobseeker.
 *
 * Considers only postings that are published, not closed, not past their
 * deadline, from a company that isn't suspended - and that the user hasn't
 * already applied to. "Applied" means a tracked application linked to the
 * posting, or one with the same title + company (covers jobs added by hand).
 */
export async function getRecommendations(
  userId: string,
  limit = 4,
  now: Date = new Date(),
): Promise<RecommendationsResponse> {
  const ctx = await loadJobseekerContext(userId);
  if (!ctx) return { jobs: [], ready: false };

  const candidate = buildCandidateSignals(ctx);
  if (candidate.skills.length === 0 && candidate.roles.length === 0) {
    return { jobs: [], ready: false };
  }

  const rows = await db
    .select({
      posting: jobPostings,
      companyName: companies.name,
      companyLogo: companies.logo,
    })
    .from(jobPostings)
    .innerJoin(companies, eq(jobPostings.companyId, companies.id))
    .where(
      and(
        eq(jobPostings.status, "published"),
        isNull(jobPostings.closedAt),
        or(isNull(jobPostings.applicationDeadline), gt(jobPostings.applicationDeadline, now)),
        ne(companies.status, "suspended"),
        notExists(
          db
            .select({ one: sql`1` })
            .from(jobs)
            .where(
              and(
                eq(jobs.userId, userId),
                or(
                  eq(jobs.jobPostingId, jobPostings.id),
                  and(
                    sql`lower(trim(${jobs.jobTitle})) = lower(trim(${jobPostings.title}))`,
                    sql`lower(trim(${jobs.companyName})) = lower(trim(${companies.name}))`,
                  ),
                ),
              ),
            ),
        ),
      ),
    )
    .orderBy(desc(jobPostings.publishedAt))
    .limit(CANDIDATE_POOL);

  const scored: Array<{ job: RecommendedJob; deadline: number }> = [];

  for (const { posting, companyName, companyLogo } of rows) {
    const match = scorePosting(candidate, {
      title: posting.title,
      description: posting.description,
      requirements: posting.requirements,
      tags: posting.tags,
      location: posting.location,
      workMode: posting.workMode,
      jobType: posting.jobType,
      salaryMin: posting.salaryMin,
      salaryMax: posting.salaryMax,
      salaryCurrency: posting.salaryCurrency,
    });
    if (!match || match.score < MIN_MATCH_SCORE) continue;

    const deadline = posting.applicationDeadline;
    scored.push({
      deadline: deadline ? deadline.getTime() : Number.POSITIVE_INFINITY,
      job: {
        id: posting.id,
        slug: posting.slug,
        title: posting.title,
        company: { name: companyName, logo: companyLogo },
        location: posting.location,
        jobType: posting.jobType,
        workMode: posting.workMode,
        salaryMin: posting.salaryMin,
        salaryMax: posting.salaryMax,
        salaryCurrency: posting.salaryCurrency,
        applicationDeadline: deadline ? deadline.toISOString() : null,
        daysLeft: deadline
          ? Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / DAY_MS))
          : null,
        publishedAt: posting.publishedAt ? posting.publishedAt.toISOString() : null,
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        reasons: match.reasons,
      },
    });
  }

  // Best match first; closer deadline breaks ties so urgent ones surface.
  scored.sort((a, b) => b.job.matchScore - a.job.matchScore || a.deadline - b.deadline);

  return { jobs: scored.slice(0, limit).map((s) => s.job), ready: true };
}
