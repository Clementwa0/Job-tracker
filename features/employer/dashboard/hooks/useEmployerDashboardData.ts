"use client";

import { useCallback, useEffect, useState } from "react";
import type { EmployerCompany, EmployerJobPosting } from "@/types/employer";
import { employerService } from "@/features/employer/services/employer.client";

export type EmployerDashboardStatus = "loading" | "error" | "ready";
export interface EmployerDashboardState { status: EmployerDashboardStatus; company: EmployerCompany | null; jobs: EmployerJobPosting[]; retry: () => void; }

export function useEmployerDashboardData(): EmployerDashboardState {
  const [status, setStatus] = useState<EmployerDashboardStatus>("loading"); const [company, setCompany] = useState<EmployerCompany | null>(null); const [jobs, setJobs] = useState<EmployerJobPosting[]>([]);
  const load = useCallback(async () => { setStatus("loading"); try { const dashboard = await employerService.getDashboard(); setCompany(dashboard.company ?? null); setJobs(dashboard.recentPostings); setStatus("ready"); } catch { setStatus("error"); } }, []);
  useEffect(() => { void load(); }, [load]);
  return { status, company, jobs, retry: load };
}
export default useEmployerDashboardData;
