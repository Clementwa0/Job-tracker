"use client";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { useResource } from "@/lib/client/useResource";
import { jobStatsKey } from "@/lib/client/dataKeys";
import type { JobStats } from "@/types/job";

const EMPTY_COUNTS = { applications: 0, responses: 0, interviews: 0, offers: 0 };

const EMPTY_STATS: JobStats = {
  total: 0,
  statusCounts: {},
  responseCount: 0,
  responseRate: 0,
  interviewCount: 0,
  offerCount: 0,
  rejectedCount: 0,
  window: { days: 7, currentStart: "", previousStart: "", end: "" },
  current: EMPTY_COUNTS,
  previous: EMPTY_COUNTS,
  trends: { applications: null, responses: null, interviews: null, offers: null },
};

/** The rolling windows move with the clock, so re-pull now and then. */
const REFRESH_MS = 2 * 60_000;

/**
 * Dashboard statistics (totals, real response rate, and last-7-days vs
 * previous-7-days trends), computed by the API from the user's data.
 *
 * Kept fresh by `invalidateJobData()`, which every application and interview
 * mutation calls (so any change anywhere re-pulls these numbers), plus the
 * focus / interval refresh below for changes made on another device. This
 * replaced a signature of job ids and statuses that missed edits to dates,
 * interviews and anything else outside those fields.
 */
export function useDashboardStats() {
  const { user } = useAuth();

  const key = user?.role === "user" ? jobStatsKey(user._id) : null;
  const { data, isLoading, refresh } = useResource<JobStats>(
    key,
    () => jobService.getStats(),
    { pollMs: REFRESH_MS },
  );

  return { stats: data ?? EMPTY_STATS, isLoading, refetch: refresh };
}
