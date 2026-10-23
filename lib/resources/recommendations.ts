import { and, desc, eq, gte, inArray, notInArray, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { interviews, jobs, resourceCategories, resources } from "@/lib/db/schema";
import type { RecommendedResource } from "@/types/resource";
import { resourceListColumns, toListItem } from "./queries";
import { escapeLike } from "./shared";

/**
 * Simple, explainable recommendations from what a jobseeker is already doing
 * in JobTrail. No AI: each signal maps to a few keywords, and published
 * resources whose title, description or tags contain them are suggested,
 * highest-priority signal first. Returns [] when nothing matches (the UI
 * then hides the section rather than showing filler).
 */

interface Signal {
  reason: string;
  keywords: string[];
}

const WINDOW_DAYS = 14;

export async function recommendResources(userId: string, limit = 4): Promise<RecommendedResource[]> {
  const now = new Date();
  const soon = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [statusRows, upcoming] = await Promise.all([
    db
      .select({ status: jobs.applicationStatus, n: sql<number>`count(*)`.mapWith(Number) })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), eq(jobs.isArchived, false)))
      .groupBy(jobs.applicationStatus),
    db
      .select({ id: interviews.id })
      .from(interviews)
      .where(
        and(
          eq(interviews.userId, userId),
          inArray(interviews.status, ["scheduled", "rescheduled"]),
          gte(interviews.interviewDate, now),
          sql`${interviews.interviewDate} <= ${soon.toISOString()}`,
        ),
      )
      .limit(1),
  ]);

  const count = (...statuses: string[]) =>
    statusRows.filter((r) => statuses.includes(r.status)).reduce((sum, r) => sum + r.n, 0);
  const total = statusRows.reduce((sum, r) => sum + r.n, 0);

  const signals: Signal[] = [];
  if (upcoming.length > 0 || count("interviewing") > 0) {
    signals.push({
      reason: upcoming.length > 0 ? "You have an upcoming interview" : "You're in the interview stage",
      keywords: ["interview"],
    });
  }
  if (count("offer") > 0) {
    signals.push({ reason: "You have a job offer", keywords: ["offer", "negotiat", "salary"] });
  }
  if (count("rejected", "ghosted") > 0) {
    signals.push({
      reason: "Learn from recent responses",
      keywords: ["rejection", "feedback", "follow-up", "follow up"],
    });
  }
  if (count("applied", "waiting_response") > 0) {
    signals.push({
      reason: "You have applications awaiting a reply",
      keywords: ["follow-up", "follow up", "cover letter", "resume", "cv"],
    });
  }
  if (total === 0) {
    signals.push({ reason: "Getting your job search started", keywords: ["job search", "resume", "cv", "getting started"] });
  }

  const picked: RecommendedResource[] = [];
  for (const signal of signals) {
    if (picked.length >= limit) break;

    const matchers = signal.keywords.flatMap((k) => {
      const pattern = `%${escapeLike(k)}%`;
      return [
        sql`${resources.title} ilike ${pattern}`,
        sql`${resources.description} ilike ${pattern}`,
        sql`array_to_string(${resources.tags}, ' ') ilike ${pattern}`,
      ];
    });

    const conditions: SQL[] = [eq(resources.status, "published"), or(...matchers) as SQL];
    if (picked.length) conditions.push(notInArray(resources.id, picked.map((p) => p.id)));

    const rows = await db
      .select(resourceListColumns)
      .from(resources)
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(and(...conditions))
      .orderBy(desc(resources.featured), desc(resources.publishedAt))
      .limit(limit - picked.length);

    for (const row of rows) picked.push({ ...toListItem(row), reason: signal.reason });
  }

  return picked;
}
