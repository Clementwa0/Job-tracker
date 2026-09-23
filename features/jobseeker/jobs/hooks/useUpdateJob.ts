"use client";

import { useCallback, useState } from "react";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Job } from "@/types/job";

export interface UpdateJobResult {
  job: Job | null;
  error: string | null;
}

export function useUpdateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJob = useCallback(
    async (id: string, payload: Partial<Job>): Promise<UpdateJobResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const job = await jobService.updateJob(id, payload);
        return { job, error: null };
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        return { job: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateJob, isLoading, error };
}
