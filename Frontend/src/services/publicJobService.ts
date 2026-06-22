import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  PublicJobDetail,
  PublicJobFilters,
  PublicJobListItem,
  PublicJobsMeta,
} from "@/types/jobPosting";

function buildQuery(filters: PublicJobFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const publicJobService = {
  async list(filters: PublicJobFilters = {}) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<PublicJobListItem[]> & { meta: PublicJobsMeta }
    >(`/public/jobs${buildQuery(filters)}`);
    return { jobs: data.data ?? [], meta: data.meta };
  },

  async getBySlug(slug: string) {
    const { data } = await axiosInstance.get<ApiSuccessResponse<PublicJobDetail>>(
      `/public/jobs/${encodeURIComponent(slug)}`,
    );
    return data.data;
  },
};
