import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { Job } from "@/types";
import { useAuth } from "@/hooks/AuthContext";
import {
  fetchJobs,
  createJob,
  updateJob as updateJobApi,
  deleteJob as deleteJobApi,
  type CreateJobRequest,
} from "@/features/jobs/api/jobs-api";
import { mapJobToBackendPayload } from "@/features/jobs/utils/job-mappers";
import { ApiClientError } from "@/lib/api-client";

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  addJob: (job: Omit<Job, "id">) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  refreshJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      toast.error("Error loading jobs", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    loadJobs();
  }, [isAuthenticated, authLoading, loadJobs]);

  const addJob = async (job: Omit<Job, "id">) => {
    try {
      const payload: CreateJobRequest = {
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        jobType: job.jobType,
        applicationDate: job.applicationDate,
        applicationDeadline: job.applicationDeadline,
        applicationStatus: job.status,
        salaryRange: job.salaryRange,
        resumeFile: job.resumeFile,
        source: job.source,
        contactPerson: job.contactPerson,
        contactEmail: job.contactEmail,
        contactPhone: job.contactPhone,
        jobPostingUrl: job.jobPostingUrl,
        notes: job.notes,
        interviews: job.interviews,
      };
      const newJob = await createJob(payload);
      setJobs((prev) => [...prev, newJob]);
      toast.success("Job added", {
        description: `${job.title} at ${job.company}`,
      });
    } catch (error) {
      toast.error("Failed to add job", {
        description: getErrorMessage(error),
      });
      throw error;
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    try {
      const payload = mapJobToBackendPayload(updatedJob);
      const updated = await updateJobApi(id, payload);
      setJobs((prev) =>
        prev.map((job) => (job.id === id ? updated : job))
      );
      toast.success("Job updated", {
        description: "Update successful.",
      });
    } catch (error) {
      toast.error("Update failed", {
        description: getErrorMessage(error),
      });
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await deleteJobApi(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      toast.success("Job deleted", {
        description: "The job has been removed.",
      });
    } catch (error) {
      toast.error("Delete failed", {
        description: getErrorMessage(error),
      });
      throw error;
    }
  };

  const getJob = (id: string) => jobs.find((job) => job.id === id);

  return (
    <JobContext.Provider
      value={{
        jobs,
        isLoading,
        addJob,
        updateJob,
        deleteJob,
        getJob,
        refreshJobs: loadJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }
  return context;
};
