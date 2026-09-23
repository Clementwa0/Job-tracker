import { and, count, desc, eq, gte, inArray, isNull, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { interviews, jobs } from "@/lib/db/schema";
import { OPEN_STATUSES, RESPONSE_STATUSES } from "@/lib/jobs/status";
import { responseRatePercent } from "@/lib/jobs/statsMath";
import type { AnalyticsSummary } from "@/types/job";

const TIMELINE_DAYS = 30;
const TOP_N = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const countWhere = (condition: SQL) =>
  sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

/**
 * Analytics for the caller's (non-archived) applications, computed from the
 * database. Response/offer figures use the preserved history markers, so
 * they don't shrink when an application moves on to a later status.
 */
export async function getAnalyticsSummary(
  userId: string,
  now: Date = new Date(),
): Promise<AnalyticsSummary> {
  const mine = and(eq(jobs.userId, userId), eq(jobs.isArchived, false));

  const responded = sql`(${jobs.respondedAt} is not null or ${inArray(jobs.applicationStatus, [...RESPONSE_STATUSES])})`;
  const offered = sql`(${jobs.offerAt} is not null or ${eq(jobs.applicationStatus, "offer")})`;

  const [agg] = await db
    .select({
      total: count(),
      responded: countWhere(responded),
      offered: countWhere(offered),
      rejected: countWhere(sql`${eq(jobs.applicationStatus, "rejected")}`),
      active: countWhere(sql`${inArray(jobs.applicationStatus, [...OPEN_STATUSES])}`),
    })
    .from(jobs)
    .where(mine);

  // Applications that reached an interview: currently interviewing / at offer,
  // or with at least one interview booked.
  const withInterview = db
    .select({ id: interviews.jobId })
    .from(interviews)
    .where(eq(interviews.userId, userId));
  const [interviewed] = await db
    .select({ n: count() })
    .from(jobs)
    .where(
      and(
        mine,
        or(inArray(jobs.applicationStatus, ["interviewing", "offer"]), inArray(jobs.id, withInterview)),
      ),
    );

  const [upcoming] = await db
    .select({
      n: sql<number>`count(*) filter (where ${inArray(interviews.status, ["scheduled", "rescheduled"])})`.mapWith(Number),
    })
    .from(interviews)
    .where(eq(interviews.userId, userId));

  const statusRows = await db
    .select({ status: jobs.applicationStatus, n: count() })
    .from(jobs)
    .where(mine)
    .groupBy(jobs.applicationStatus)
    .orderBy(desc(count()));

  const companies = await db
    .select({ company: jobs.companyName, n: count() })
    .from(jobs)
    .where(and(mine, ne(jobs.companyName, "")))
    .groupBy(jobs.companyName)
    .orderBy(desc(count()), jobs.companyName)
    .limit(TOP_N);

  const locations = await db
    .select({ location: jobs.location, n: count() })
    .from(jobs)
    .where(and(mine, ne(jobs.location, "")))
    .groupBy(jobs.location)
    .orderBy(desc(count()), jobs.location)
    .limit(TOP_N);

  const jobTypes = await db
    .select({ type: jobs.jobType, n: count() })
    .from(jobs)
    .where(and(mine, ne(jobs.jobType, "")))
    .groupBy(jobs.jobType)
    .orderBy(desc(count()), jobs.jobType);

  // Applications per UTC day for the last TIMELINE_DAYS days (bucketed here
  // rather than in SQL so the day boundaries are explicit and testable).
  const since = new Date(now.getTime() - (TIMELINE_DAYS - 1) * DAY_MS);
  since.setUTCHours(0, 0, 0, 0);
  const dated = await db
    .select({ applicationDate: jobs.applicationDate, createdAt: jobs.createdAt })
    .from(jobs)
    .where(
      and(
        mine,
        or(
          gte(jobs.applicationDate, since),
          and(isNull(jobs.applicationDate), gte(jobs.createdAt, since)),
        ),
      ),
    );

  const buckets = new Map<string, number>();
  for (let i = 0; i < TIMELINE_DAYS; i++) {
    buckets.set(new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10), 0);
  }
  for (const row of dated) {
    const day = (row.applicationDate ?? row.createdAt).toISOString().slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }

  return {
    version: 1,
    generatedAt: now.toISOString(),
    metrics: {
      totalJobs: agg.total,
      statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, r.n])),
      responseRate: responseRatePercent(agg.responded, agg.total),
      interviewRate: responseRatePercent(interviewed.n, agg.total),
      offerRate: responseRatePercent(agg.offered, agg.total),
      activeApplications: agg.active,
      interviewCount: upcoming.n,
      offerCount: agg.offered,
      rejectedCount: agg.rejected,
    },
    charts: {
      status: statusRows.map((r) => ({ key: r.status, status: r.status, count: r.n })),
      companies: companies.map((r) => ({ company: r.company, count: r.n })),
      locations: locations.map((r) => ({ location: r.location, count: r.n })),
      jobTypes: jobTypes.map((r) => ({ type: r.type, count: r.n })),
      timeline: [...buckets].map(([date, n]) => ({ date, count: n })),
    },
  };
}
