import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { BackendJob, Job, JobPayload, JobFilters, JobActivity, JobsListMeta, AnalyticsSummary, JobStats } from "@/types/job";
import {
  mapBackendJobToFrontend,
  mapFrontendJobToBackend,
} from "@/lib/mappers/jobMapper";
import { uploadService } from "@/lib/storage/upload.client";
import { invalidateJobData } from "@/lib/client/dataKeys";

/** Server-side cap on `limit` (see app/api/jobs/route.ts MAX_LIMIT). */
const SERVER_MAX_LIMIT = 200;
/** Safety stop so a bad `total` can never loop forever (~10,000 applications). */
const MAX_PAGES = 50;

async function resolveFileField(
  value: string | File | null | undefined,
): Promise<string | null | undefined> {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  return uploadService.uploadFile(value);
}

async function resolveJobFiles(job: Partial<Job>): Promise<Partial<Job>> {
  const resolved = { ...job };
  if (job.coverLetterFile !== undefined) {
    resolved.coverLetterFile = (await resolveFileField(job.coverLetterFile)) ?? null;
  }
  return resolved;
}

type JobsListResponse = ApiSuccessResponse<BackendJob[]>;
type JobResponse = ApiSuccessResponse<BackendJob>;
type CreateJobResponse = ApiSuccessResponse<{ job: BackendJob }>;

export interface JobsListResult {
  jobs: Job[];
  meta: JobsListMeta;
}

function buildQuery(filters?: JobFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      if (v.length) params.set(k, v.join(","));
    } else {
      params.set(k, String(v));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export const jobService = {
  async getJobs(filters?: JobFilters): Promise<Job[]> {
    const result = await this.getJobsPaginated(filters);
    return result.jobs;
  },

  async getJobsPaginated(filters?: JobFilters): Promise<{ jobs: Job[]; meta: JobsListMeta }> {
    const { data } = await axiosInstance.get<JobsListResponse & { meta: JobsListMeta }>(
      `/jobs${buildQuery(filters)}`
    );
    return {
      jobs: data.data.map(mapBackendJobToFrontend),
      meta: data.meta ?? { page: 1, limit: 50, total: data.data.length },
    };
  },

  /**
   * Every application matching `filters`, not just the first page. The API
   * caps page size, so this walks the pages until it has `meta.total` rows.
   */
  async getAllJobs(filters?: Omit<JobFilters, "page" | "limit">): Promise<Job[]> {
    const all: Job[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const { jobs, meta } = await this.getJobsPaginated({
        ...filters,
        page,
        limit: SERVER_MAX_LIMIT,
      });
      all.push(...jobs);
      if (jobs.length === 0 || all.length >= meta.total) break;
    }
    return all;
  },

  async getJobById(id: string): Promise<Job> {
    const { data } = await axiosInstance.get<JobResponse>(`/jobs/${id}`);
    return mapBackendJobToFrontend(data.data);
  },

  async createJob(job: JobPayload): Promise<Job> {
    const withFiles = await resolveJobFiles(job);
    const { data } = await axiosInstance.post<CreateJobResponse>(
      "/jobs",
      mapFrontendJobToBackend(withFiles)
    );
    invalidateJobData();
    return mapBackendJobToFrontend(data.data.job);
  },

  async updateJob(id: string, job: Partial<Job>): Promise<Job> {
    const withFiles = await resolveJobFiles(job);
    const { data } = await axiosInstance.put<JobResponse>(
      `/jobs/${id}`,
      mapFrontendJobToBackend(withFiles)
    );
    invalidateJobData();
    return mapBackendJobToFrontend(data.data);
  },

  async deleteJob(id: string): Promise<void> {
    await axiosInstance.delete<ApiSuccessResponse<null>>(`/jobs/${id}`);
    invalidateJobData();
  },

  async duplicateJob(id: string): Promise<Job> {
    const { data } = await axiosInstance.post<JobResponse>(`/jobs/${id}/duplicate`);
    invalidateJobData();
    return mapBackendJobToFrontend(data.data);
  },

  async archiveJob(id: string, archive = true): Promise<Job> {
    const { data } = await axiosInstance.post<JobResponse>(`/jobs/${id}/archive`, { archive });
    invalidateJobData();
    return mapBackendJobToFrontend(data.data);
  },

  async addActivity(id: string, entry: Pick<JobActivity, "type" | "message" | "meta">): Promise<Job> {
    const { data } = await axiosInstance.post<JobResponse>(`/jobs/${id}/activity`, entry);
    invalidateJobData();
    return mapBackendJobToFrontend(data.data);
  },

  async bulkUpdate(ids: string[], patch: Partial<Job>): Promise<{ matched: number; modified: number }> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<{ matched: number; modified: number }>>(
      "/jobs/bulk/update",
      { ids, patch: mapFrontendJobToBackend(patch) }
    );
    invalidateJobData();
    return data.data;
  },

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<{ deleted: number }>>(
      "/jobs/bulk/delete",
      { ids }
    );
    invalidateJobData();
    return data.data;
  },

  async getStats(): Promise<JobStats> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<JobStats>>("/jobs/stats");
    return data.data;
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AnalyticsSummary>>(
      "/jobs/analytics/summary"
    );
    return data.data;
  },
};
