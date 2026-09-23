import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { PublicJobDetail, PublicJobFilters, PublicJobListItem, PublicJobsMeta } from "@/types/jobPosting";

export const publicJobBoardService = {
  async list(filters: PublicJobFilters = {}) {
    const { data } = await axiosInstance.get<ApiSuccessResponse<PublicJobListItem[]> & { meta: PublicJobsMeta }>("/job-board", { params: filters });
    return { jobs: data.data, meta: data.meta };
  },
  async get(slug: string) {
    const { data } = await axiosInstance.get<ApiSuccessResponse<PublicJobDetail>>(`/job-board/${encodeURIComponent(slug)}`);
    return data.data;
  },
};
