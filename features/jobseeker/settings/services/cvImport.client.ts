import axiosInstance from "@/lib/axiosInstance";

export interface CvImportResult {
  confidence: number;
  warnings: string[];
  fileName: string;
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
