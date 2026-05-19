import { useCallback, useState } from "react";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Job, JobPayload } from "@/types/job";

export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = useCallback(async (payload: JobPayload): Promise<Job | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await jobService.createJob(payload);
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createJob, isLoading, error };
}
