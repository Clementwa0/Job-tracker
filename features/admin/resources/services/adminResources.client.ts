import axios from "axios";

import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type { PaginatedMeta } from "@/types/admin";
import type {
  AdminResource,
  AdminResourceListItem,
  AdminResourceSummary,
  ResourceCategory,
  StoredFile,
} from "@/types/resource";
import type { CategoryInput, ResourceInput } from "@/lib/resources/schema";

export type ResourcePayload = Omit<ResourceInput, "externalUrl"> & { externalUrl: string | null };

export interface ListAdminResourcesParams {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

/** Per-field messages from a 422 response (`errors: [{ field, message }]`). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) return {};
  const errors = (error.response?.data as { errors?: Array<{ field?: string; message?: string }> } | undefined)?.errors;
  const out: Record<string, string> = {};
  for (const e of errors ?? []) if (e.field && e.message && !(e.field in out)) out[e.field] = e.message;
  return out;
}

export const adminResourcesService = {
  async list(params: ListAdminResourcesParams) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<AdminResourceListItem[]> & { meta: PaginatedMeta; summary: AdminResourceSummary }
    >("/admin/resources", { params });
    return { items: data.data ?? [], meta: data.meta, summary: data.summary };
  },

  async get(id: string) {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AdminResource>>(`/admin/resources/${id}`);
    return data.data;
  },

  async create(payload: ResourcePayload) {
    const { data } = await axiosInstance.post<ApiSuccessResponse<AdminResource>>("/admin/resources", payload);
    return data.data;
  },

  async update(id: string, payload: ResourcePayload) {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminResource>>(`/admin/resources/${id}`, payload);
    return data.data;
  },

  async action(id: string, action: "publish" | "unpublish" | "feature" | "unfeature") {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminResource>>(`/admin/resources/${id}/${action}`);
    return data.data;
  },

  async remove(id: string) {
    await axiosInstance.delete(`/admin/resources/${id}`);
  },

  async upload(file: File, kind: "cover" | "attachment") {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    const { data } = await axiosInstance.post<ApiSuccessResponse<StoredFile>>("/admin/resources/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  /** Best-effort discard of a file uploaded but never saved. Never throws. */
  async discardUpload(url: string) {
    try {
      await axiosInstance.delete("/admin/resources/upload", { params: { url } });
    } catch (error) {
      console.warn("Could not discard uploaded file:", error);
    }
  },

  /* ---- categories ---- */
  async listCategories() {
    const { data } = await axiosInstance.get<ApiSuccessResponse<ResourceCategory[]>>("/admin/resource-categories");
    return data.data ?? [];
  },
  async createCategory(input: Pick<CategoryInput, "name" | "description" | "isActive">) {
    const { data } = await axiosInstance.post<ApiSuccessResponse<ResourceCategory>>("/admin/resource-categories", input);
    return data.data;
  },
  async updateCategory(id: string, input: Partial<CategoryInput>) {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<ResourceCategory>>(`/admin/resource-categories/${id}`, input);
    return data.data;
  },
  async deleteCategory(id: string) {
    await axiosInstance.delete(`/admin/resource-categories/${id}`);
  },
  async reorderCategories(ids: string[]) {
    await axiosInstance.post("/admin/resource-categories/reorder", { ids });
  },
};
