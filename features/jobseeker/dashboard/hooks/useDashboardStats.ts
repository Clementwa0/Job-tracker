"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { useResource } from "@/lib/client/useResource";
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
 * Must be used inside `JobProvider`: the numbers are re-fetched whenever the
 * list of applications changes, so edits show up straight away.
 */
export function useDashboardStats() {
  const { user } = useAuth();
  const { jobs } = useJobs();

  const key = user?.role === "user" ? `job-stats:${user._id}` : null;
  const { data, isLoading, refresh } = useResource<JobStats>(
    key,
    () => jobService.getStats(),
    { pollMs: REFRESH_MS },
  );

  const signature = useMemo(
    () => jobs.map((j) => `${j.id}|${j.applicationStatus}|${j.isArchived ? 1 : 0}`).join(","),
    [jobs],
  );

  useEffect(() => {
    if (key) void refresh();
  }, [key, signature, refresh]);

  return { stats: data ?? EMPTY_STATS, isLoading, refetch: refresh };
}
