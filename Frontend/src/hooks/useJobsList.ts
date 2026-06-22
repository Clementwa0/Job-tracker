import { useCallback, useEffect, useState } from "react";
import type { Job, JobFilters, JobsListMeta } from "@/types/job";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";

export function useJobsList(filters: JobFilters) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<JobsListMeta>({ page: 1, limit: 50, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setIsFetching(true);
      const result = await jobService.getJobsPaginated(filters);
      setJobs(result.jobs);
      setMeta(result.meta);
    } catch (error) {
      toast({
        title: "Error loading jobs",
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, meta, isLoading, isFetching, refetch: fetchJobs };
}
