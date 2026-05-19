import { useCallback, useState } from "react";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Job } from "@/types/job";

export function useUpdateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = useCallback(
    async (id: string, payload: Partial<Job>): Promise<Job | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await jobService.updateJob(id, payload);
      } catch (err) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateJob, isLoading, error };
}
