import { useCallback, useEffect, useState } from "react";
import type { PublicJobFilters, PublicJobListItem, PublicJobsMeta } from "@/types/jobPosting";
import { publicJobService } from "@/services/publicJobService";
import { getApiErrorMessage } from "@/lib/apiError";

const DEFAULT_META: PublicJobsMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

export function usePublicJobs(filters: PublicJobFilters) {
  const [jobs, setJobs] = useState<PublicJobListItem[]>([]);
  const [meta, setMeta] = useState<PublicJobsMeta>(DEFAULT_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const result = await publicJobService.list(filters);
      setJobs(result.jobs);
      setMeta(result.meta);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, meta, isLoading, isFetching, error, refetch: fetchJobs };
}
