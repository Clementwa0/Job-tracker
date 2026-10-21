import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";

export interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const uploadService = {
  async uploadFile(file: File, options: { private?: boolean } = {}): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    if (options.private) formData.append("private", "true");

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
      const parsed = new URL(url, window.location.origin);
      const publicId = parsed.pathname === "/api/upload" ? parsed.searchParams.get("publicId") : null;
      await axiosInstance.delete("/upload", { params: publicId ? { publicId } : { url } });
    } catch (error) {
      console.warn("Could not delete uploaded file:", error);
    }
  },

  async downloadFile(url: string, filename: string): Promise<void> {
    const { data } = await axiosInstance.get<Blob>(url, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  },
};

export function resolveApiAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/api\/?$/, "") || "";
  return `${base}${path}`;
}
