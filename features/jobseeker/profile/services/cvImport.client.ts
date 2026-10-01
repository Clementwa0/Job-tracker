import axiosInstance from "@/lib/axiosInstance";
import type { ParsedCv } from "@/types/profile";

export type CvImportResult = ParsedCv & { fileName: string };

export async function importCv(file: File): Promise<CvImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post<{ success: boolean; data: CvImportResult; message?: string }>(
    "/profile/import-cv",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  if (!data.success) throw new Error(data.message || "CV import failed.");
  return data.data;
}
