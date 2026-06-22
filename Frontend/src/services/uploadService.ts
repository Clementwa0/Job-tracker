import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
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
};

export function resolveApiAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    "",
  );
  return `${base}${path}`;
}
