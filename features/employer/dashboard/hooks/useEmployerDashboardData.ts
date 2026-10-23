"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  EmployerCompany,
  EmployerJobPosting,
  EmployerPostingStats,
  EmployerTopPosting,
} from "@/types/employer";
import { employerService } from "@/features/employer/services/employer.client";
import { getApiErrorMessage } from "@/lib/apiError";

export type EmployerDashboardStatus = "loading" | "error" | "ready";

export interface EmployerDashboardState {
  status: EmployerDashboardStatus;
  /** Server-provided message when `status` is "error". */
  error: string | null;
  hasCompany: boolean;
  company: EmployerCompany | null;
  /** Account-wide counts computed by the server, not derived from `jobs`. */
  stats: EmployerPostingStats;
  topPostings: EmployerTopPosting[];
  /** The five most recently updated postings - a preview, not the full list. */
  jobs: EmployerJobPosting[];
  retry: () => void;
}

export const EMPTY_EMPLOYER_STATS: EmployerPostingStats = {
  totalJobs: 0,
  published: 0,
  expired: 0,
  drafts: 0,
  pendingReview: 0,
  closed: 0,
  totalViews: 0,
  closingSoon: 0,
  avgViewsPerLivePosting: 0,
};

export function useEmployerDashboardData(): EmployerDashboardState {
  const [status, setStatus] = useState<EmployerDashboardStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [hasCompany, setHasCompany] = useState(false);
  const [company, setCompany] = useState<EmployerCompany | null>(null);
  const [stats, setStats] = useState<EmployerPostingStats>(EMPTY_EMPLOYER_STATS);
  const [topPostings, setTopPostings] = useState<EmployerTopPosting[]>([]);
  const [jobs, setJobs] = useState<EmployerJobPosting[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const dashboard = await employerService.getDashboard();
      setHasCompany(dashboard.hasCompany);
      setCompany(dashboard.company ?? null);
      setStats({ ...EMPTY_EMPLOYER_STATS, ...dashboard.stats });
      setTopPostings(dashboard.topPostings ?? []);
      setJobs(dashboard.recentPostings ?? []);
      setStatus("ready");
    } catch (err) {
      setError(getApiErrorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { status, error, hasCompany, company, stats, topPostings, jobs, retry: load };
}

export default useEmployerDashboardData;
