import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { PaginatedMeta } from "@/types/admin";
import type { RecommendedResource, ResourceCategory, ResourceListItem } from "@/types/resource";

export interface ResourceQuery {
  q?: string;
  category?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ResourcePage {
  items: ResourceListItem[];
  meta: PaginatedMeta;
}

type ListResponse = ApiSuccessResponse<ResourceListItem[]> & { meta: PaginatedMeta };

export const resourcesService = {
  async list(params: ResourceQuery): Promise<ResourcePage> {
    const { data } = await axiosInstance.get<ListResponse>("/resources", {
      params: { ...params, featured: params.featured ? "true" : undefined },
    });
    return { items: data.data ?? [], meta: data.meta };
  },

  async categories(): Promise<ResourceCategory[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<ResourceCategory[]>>("/resource-categories");
    return data.data ?? [];
  },

  /* ---- jobseeker only ---- */
  async recommended(): Promise<RecommendedResource[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<RecommendedResource[]>>("/resources/recommended");
    return data.data ?? [];
  },

  async bookmarkIds(): Promise<string[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<string[]>>("/resource-bookmarks/ids");
    return data.data ?? [];
  },

  async bookmarks(params: { page?: number; limit?: number }): Promise<ResourcePage> {
    const { data } = await axiosInstance.get<ListResponse>("/resource-bookmarks", { params });
    return { items: data.data ?? [], meta: data.meta };
  },

  async addBookmark(resourceId: string) {
    await axiosInstance.post("/resource-bookmarks", { resourceId });
  },

  async removeBookmark(resourceId: string) {
    await axiosInstance.delete(`/resource-bookmarks/${resourceId}`);
  },
};
