import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { SavedJob, SaveJobInput } from "@/lib/savedJobs/types";

export const savedJobService = {
  async list(): Promise<SavedJob[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<SavedJob[]>>("/saved-jobs");
    return data.data;
  },

  async save(job: SaveJobInput): Promise<SavedJob> {
    const { data } = await axiosInstance.post<
      ApiSuccessResponse<{ job: SavedJob; created: boolean }>
    >("/saved-jobs", job);
    return data.data.job;
  },

  async remove(slug: string): Promise<void> {
    await axiosInstance.delete(`/saved-jobs/${encodeURIComponent(slug)}`);
  },
};
