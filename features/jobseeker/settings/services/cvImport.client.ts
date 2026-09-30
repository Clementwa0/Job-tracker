import axiosInstance from "@/lib/axiosInstance";

export interface CvImportResult {
  /** Confidence score from the AI, 0–1. */
  confidence: number;
  /** Non-fatal issues the parser wants the user to double-check. */
  warnings: string[];
  /** Original filename the user uploaded. */
  fileName: string;
  /** Absolute URL of the stored file (used for audit / re-open). */
  storedUrl: string;

  contact: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };

  summary: string;
  skills: string[];

  experience: Array<{
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }>;

  education: Array<{
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    notes: string;
  }>;

  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
}

interface CvImportApiResponse {
  success: boolean;
  data: CvImportResult;
  message?: string;
}

export async function importCv(file: File): Promise<CvImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosInstance.post<CvImportApiResponse>(
    "/profile/import-cv",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  if (!data.success) {
    throw new Error(data.message || "CV import failed.");
  }

  return data.data;
}