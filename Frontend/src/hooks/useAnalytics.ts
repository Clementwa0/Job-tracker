import { useCallback, useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/types/job";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const summary = await jobService.getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast({ title: "Failed to load analytics", description: message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, isLoading, error, refetch: fetchAnalytics };
}
