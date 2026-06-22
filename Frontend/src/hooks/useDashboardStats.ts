import { useCallback, useEffect, useState } from "react";
import { jobService } from "@/services/jobService";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    interviewed: 0,
    offered: 0,
    rejected: 0,
    responseRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await jobService.getStats();
      const sc = data.statusCounts;
      setStats({
        total: data.total,
        inProgress: sc.applied || 0,
        interviewed: data.interviewCount,
        offered: data.offerCount,
        rejected: data.rejectedCount,
        responseRate: data.responseRate,
      });
    } catch {
      // keep previous stats on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { ...stats, isLoading, refetch: fetchStats };
}
