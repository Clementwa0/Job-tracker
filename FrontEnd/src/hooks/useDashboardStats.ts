import { useMemo } from "react";
import { useJobs } from "@/hooks/JobContext";

export const useDashboardStats = () => {
  const { jobs } = useJobs();

  return useMemo(() => {
    const normalize = (s?: string) => s?.toLowerCase();

    return {
      total: jobs.length,
      inProgress: jobs.filter(j => normalize(j.status) === "applied").length,
      interviewed: jobs.filter(j => normalize(j.status) === "interviewing").length,
      offered: jobs.filter(j => normalize(j.status) === "offer").length,
      rejected: jobs.filter(j => normalize(j.status) === "rejected").length,
    };
  }, [jobs]);
};