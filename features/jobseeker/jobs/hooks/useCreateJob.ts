"use client";

import { useCallback, useState } from "react";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Job, JobPayload } from "@/types/job";

export interface CreateJobResult {
  job: Job | null;
  error: string | null;
}

export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = useCallback(async (payload: JobPayload): Promise<CreateJobResult> => {
    setIsLoading(true);
    setError(null);
    try {
      const job = await jobService.createJob(payload);
      return { job, error: null };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      return { job: null, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createJob, isLoading, error };
}
