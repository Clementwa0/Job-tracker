import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "raw";
  format: string;
  originalFilename: string;
  uploadedAt: string;
}

export const uploadService = {
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post<ApiSuccessResponse<UploadedFile>>(
      "/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return data.data.url;
  },

  /** Best-effort removal of a previously uploaded file; never throws. */
  async deleteFile(url: string): Promise<void> {
    try {
      await axiosInstance.delete("/upload", { params: { url } });
    } catch (error) {
      console.warn("Could not delete uploaded file:", error);
    }
  },
};

export function resolveApiAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/api\/?$/, "") || "";
  return `${base}${path}`;
}
