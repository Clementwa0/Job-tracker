import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { BackendJob, Job, JobPayload } from "@/types/job";
import {
  mapBackendJobToFrontend,
  mapFrontendJobToBackend,
} from "@/lib/mappers/jobMapper";

type JobsListResponse = ApiSuccessResponse<BackendJob[]>;
type JobResponse = ApiSuccessResponse<BackendJob>;
type CreateJobResponse = ApiSuccessResponse<{ job: BackendJob }>;

export const jobService = {
  async getJobs(): Promise<Job[]> {
    const { data } = await axiosInstance.get<JobsListResponse>("/jobs");
    return data.data.map(mapBackendJobToFrontend);
  },

  async getJobById(id: string): Promise<Job> {
    const { data } = await axiosInstance.get<JobResponse>(`/jobs/${id}`);
    return mapBackendJobToFrontend(data.data);
  },

  async createJob(job: JobPayload): Promise<Job> {
    const { data } = await axiosInstance.post<CreateJobResponse>(
      "/jobs",
      mapFrontendJobToBackend(job),
    );
    return mapBackendJobToFrontend(data.data.job);
  },

  async updateJob(id: string, job: Partial<Job>): Promise<Job> {
    const { data } = await axiosInstance.put<JobResponse>(
      `/jobs/${id}`,
      mapFrontendJobToBackend(job),
    );
    return mapBackendJobToFrontend(data.data);
  },

  async deleteJob(id: string): Promise<void> {
    await axiosInstance.delete<ApiSuccessResponse<null>>(`/jobs/${id}`);
  },
};
