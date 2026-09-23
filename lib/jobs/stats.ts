import { and, count, eq, inArray, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { interviews, jobs } from "@/lib/db/schema";
import { RESPONSE_STATUSES } from "@/lib/jobs/status";
import type { JobStats, JobStatsWindowCounts } from "@/types/job";
import {
  WINDOW_DAYS,
  responseRatePercent,
  statsWindows,
  trendPercent,
} from "@/lib/jobs/statsMath";

// Timestamps go in as ISO strings with an explicit cast: raw `sql` params
// don't get a column's Date encoder, so don't hand them a Date directly.
const ts = (d: Date): SQL => sql`${d.toISOString()}::timestamptz`;

const between = (expr: SQL, from: Date, to: Date): SQL =>
  sql`(${expr} >= ${ts(from)} and ${expr} < ${ts(to)})`;

const countWhere = (condition: SQL) =>
  sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

/**
 * Everything the dashboard's stat cards show, computed in the database for
 * one user: totals, the real response rate, and two adjacent 7-day windows
 * ("last 7 days" vs the 7 days before that) with the % change between them.
 */
export async function getJobStats(userId: string, now: Date = new Date()): Promise<JobStats> {
  const { currentStart, previousStart, end } = statsWindows(now, WINDOW_DAYS);

  // When each event happened. responded_at / offer_at are stamped the first
  // time the job reaches that state; the updated_at fallback only covers rows
  // that predate those columns.
  const appliedOn = sql`coalesce(${jobs.applicationDate}, ${jobs.createdAt})`;
  const respondedOn = sql`coalesce(${jobs.respondedAt}, ${jobs.updatedAt})`;
  const offerOn = sql`coalesce(${jobs.offerAt}, ${jobs.updatedAt})`;

  // "Responded" and "offered" are history, not current state: a job that
  // reached interviewing/offer still counts after it moves on (offer →
  // completed, interviewing → ghosted…). responded_at / offer_at record that;
  // the status test covers rows that predate those columns.
  const statusIsResponse = inArray(jobs.applicationStatus, [...RESPONSE_STATUSES]);
  const everResponded = sql`(${jobs.respondedAt} is not null or ${statusIsResponse})`;
  const everOffered = sql`(${jobs.offerAt} is not null or ${eq(jobs.applicationStatus, "offer")})`;

  const mine = and(eq(jobs.userId, userId), eq(jobs.isArchived, false));

  const [agg] = await db
    .select({
      total: count(),
      responded: countWhere(everResponded),
      offers: countWhere(everOffered),
      rejected: countWhere(eq(jobs.applicationStatus, "rejected")),
      appsCur: countWhere(between(appliedOn, currentStart, end)),
      appsPrev: countWhere(between(appliedOn, previousStart, currentStart)),
      respCur: countWhere(sql`${everResponded} and ${between(respondedOn, currentStart, end)}`),
      respPrev: countWhere(sql`${everResponded} and ${between(respondedOn, previousStart, currentStart)}`),
      offerCur: countWhere(sql`${everOffered} and ${between(offerOn, currentStart, end)}`),
      offerPrev: countWhere(sql`${everOffered} and ${between(offerOn, previousStart, currentStart)}`),
    })
    .from(jobs)
    .where(mine);

  const statusRows = await db
    .select({ status: jobs.applicationStatus, n: count() })
    .from(jobs)
    .where(mine)
    .groupBy(jobs.applicationStatus);

  // Interviews: value = still upcoming; trend = how many were booked in each
  // window (excluding ones that were cancelled).
  const booked = sql`${interviews.status} <> 'canceled'`;
  const [iv] = await db
    .select({
      active: countWhere(sql`${interviews.status} in ('scheduled', 'rescheduled')`),
      cur: countWhere(sql`${booked} and ${between(sql`${interviews.createdAt}`, currentStart, end)}`),
      prev: countWhere(sql`${booked} and ${between(sql`${interviews.createdAt}`, previousStart, currentStart)}`),
    })
    .from(interviews)
    .where(eq(interviews.userId, userId));

  const current: JobStatsWindowCounts = {
    applications: agg.appsCur,
    responses: agg.respCur,
    interviews: iv.cur,
    offers: agg.offerCur,
  };
  const previous: JobStatsWindowCounts = {
    applications: agg.appsPrev,
    responses: agg.respPrev,
    interviews: iv.prev,
    offers: agg.offerPrev,
  };

  return {
    total: agg.total,
    statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, r.n])),
    responseCount: agg.responded,
    responseRate: responseRatePercent(agg.responded, agg.total),
    interviewCount: iv.active,
    offerCount: agg.offers,
    rejectedCount: agg.rejected,
    window: {
      days: WINDOW_DAYS,
      currentStart: currentStart.toISOString(),
      previousStart: previousStart.toISOString(),
      end: end.toISOString(),
    },
    current,
    previous,
    trends: {
      applications: trendPercent(current.applications, previous.applications),
      responses: trendPercent(current.responses, previous.responses),
      interviews: trendPercent(current.interviews, previous.interviews),
      offers: trendPercent(current.offers, previous.offers),
    },
  };
}
