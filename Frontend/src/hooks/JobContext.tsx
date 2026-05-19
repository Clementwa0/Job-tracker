import React, { createContext, useState, useContext, useEffect } from "react";
import type { Job, JobPayload } from "@/types/job";
import { useToast } from "@/hooks/use-toast";
import { jobService } from "@/services/jobService";
import { getApiErrorMessage } from "@/lib/apiError";

interface JobContextType {
  jobs: Job[];
  isLoading: boolean;
  addJob: (job: JobPayload) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  refetchJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const refetchJobs = async () => {
    try {
      const nextJobs = await jobService.getJobs();
      setJobs(nextJobs);
    } catch (error) {
      toast({
        title: "Error loading jobs",
        description: getApiErrorMessage(error),
      });
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      await refetchJobs();
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  const addJob = async (job: JobPayload) => {
    try {
      const created = await jobService.createJob(job);
      setJobs((prev) => [...prev, created]);
      toast({
        title: "Job added",
        description: `${job.jobTitle} at ${job.companyName}`,
      });
    } catch (error) {
      toast({
        title: "Failed to add job",
        description: getApiErrorMessage(error),
      });
    }
  };

  const updateJob = async (id: string, updatedJob: Partial<Job>) => {
    try {
      const updated = await jobService.updateJob(id, updatedJob);
      setJobs((prev) => prev.map((job) => (job.id === id ? updated : job)));
      toast({ title: "Job updated", description: "Update successful." });
    } catch (error) {
      toast({
        title: "Update failed",
        description: getApiErrorMessage(error),
      });
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await jobService.deleteJob(id);
      setJobs((prev) => prev.filter((job) => job.id !== id));
      toast({
        title: "Job deleted",
        description: "The job has been removed.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getApiErrorMessage(error),
      });
    }
  };

  const getJob = (id: string) => jobs.find((job) => job.id === id);

  return (
    <JobContext.Provider
      value={{ jobs, isLoading, addJob, updateJob, deleteJob, getJob, refetchJobs }}
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
