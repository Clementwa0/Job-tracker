"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useCallback } from "react";
import type { Job, JobPayload } from "@/types/job";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { getApiErrorMessage } from "@/lib/apiError";
import { useResource } from "@/lib/client/useResource";
import { jobsKey } from "@/lib/client/dataKeys";

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  /** Set when the list could not be loaded; `jobs` may then be stale or empty. */
  error: string | null;
  /** Each mutation shows a toast and then rethrows, so callers can react (keep a dialog open, skip navigation…). */
  addJob: (job: JobPayload) => Promise<Job>;
  updateJob: (id: string, job: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  refetchJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const NO_JOBS: Job[] = [];

/**
 * The signed-in user's applications, *all* of them (the list endpoint is
 * paginated, so this walks every page). Backed by the shared resource cache:
 * every page reads one copy, and any create/update/delete anywhere in the app
 * (see `invalidateJobData`) refreshes it.
 */
export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const key = isAuthenticated && user?.role === "user" ? jobsKey(user._id) : null;
  const { data, error, isLoading, refresh } = useResource<Job[]>(
    key,
    () => jobService.getAllJobs(),
  );

  const errorMessage = error !== undefined ? getApiErrorMessage(error) : null;
  const toastedError = useRef<string | null>(null);
  useEffect(() => {
    if (!errorMessage) {
      toastedError.current = null;
      return;
    }
    if (toastedError.current === errorMessage) return;
    toastedError.current = errorMessage;
    toast({ title: "Error loading jobs", description: errorMessage });
  }, [errorMessage, toast]);

  const jobs = data ?? NO_JOBS;

  const refetchJobs = useCallback(async () => {
    try {
      await refresh();
    } catch {
      // Surfaced through `error` / the toast above.
    }
  }, [refresh]);

  const addJob = useCallback(
    async (job: JobPayload) => {
      try {
        const created = await jobService.createJob(job);
        toast({
          title: "Job added",
          description: `${job.jobTitle} at ${job.companyName}`,
        });
        return created;
      } catch (err) {
        toast({ title: "Failed to add job", description: getApiErrorMessage(err) });
        throw err;
      }
    },
    [toast],
  );

  const updateJob = useCallback(
    async (id: string, updatedJob: Partial<Job>) => {
      try {
        const updated = await jobService.updateJob(id, updatedJob);
        toast({ title: "Job updated", description: "Update successful." });
        return updated;
      } catch (err) {
        toast({ title: "Update failed", description: getApiErrorMessage(err) });
        throw err;
      }
    },
    [toast],
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        await jobService.deleteJob(id);
        toast({ title: "Job deleted", description: "The job has been removed." });
      } catch (err) {
        toast({ title: "Delete failed", description: getApiErrorMessage(err) });
        throw err;
      }
    },
    [toast],
  );

  const getJob = useCallback((id: string) => jobs.find((job) => job.id === id), [jobs]);

  const value = useMemo<JobContextType>(
    () => ({
      jobs,
      isLoading: authLoading || isLoading,
      error: errorMessage,
      addJob,
      updateJob,
      deleteJob,
      getJob,
      refetchJobs,
    }),
    [jobs, authLoading, isLoading, errorMessage, addJob, updateJob, deleteJob, getJob, refetchJobs],
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
