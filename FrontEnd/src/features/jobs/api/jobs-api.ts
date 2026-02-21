
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, BackendJob, Job } from "@/types";
import { mapBackendJobToJob } from "../utils/job-mappers";

// ─── Request DTOs ───────────────────────────────────────────────────────────
export interface CreateJobRequest {
  jobTitle: string;
  companyName: string;
  location?: string;
  jobType?: string;
  applicationDate?: string;
  applicationDeadline?: string;
  applicationStatus?: string;
  salaryRange?: string;
  resumeFile?: string | null;
  source?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  jobPostingUrl?: string;
  notes?: string;
  interviews?: Array<{ date: string; type: string; notes: string }>;
}

// ─── API functions ──────────────────────────────────────────────────────────
export async function fetchJobs(): Promise<Job[]> {
  const res = await apiClient.get<ApiResponse<BackendJob[]>>("/jobs");
  if (!res.success || !Array.isArray(res.data)) {
    throw new Error("Invalid jobs response");
  }
  return res.data.map(mapBackendJobToJob);
}

export async function createJob(payload: CreateJobRequest): Promise<Job> {
  const res = await apiClient.post<ApiResponse<{ job: BackendJob }>>("/jobs", payload);
  if (!res.success || !res.data?.job) {
    throw new Error("Failed to create job");
  }
  return mapBackendJobToJob(res.data.job);
}

export async function updateJob(id: string, payload: Partial<CreateJobRequest>): Promise<Job> {
  const res = await apiClient.put<ApiResponse<BackendJob>>(`/jobs/${id}`, payload);
  if (!res.success || !res.data) {
    throw new Error("Failed to update job");
  }
  return mapBackendJobToJob(res.data);
}

export async function deleteJob(id: string): Promise<void> {
  const res = await apiClient.delete<ApiResponse<unknown>>(`/jobs/${id}`);
  if (!res.success) {
    throw new Error("Failed to delete job");
  }
}
