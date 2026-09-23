export type JobPostingAiFieldKey =
  | "companyName"
  | "title"
  | "category"
  | "description"
  | "responsibilities"
  | "requirements"
  | "tags"
  | "jobType"
  | "workMode"
  | "experienceLevel"
  | "educationLevel"
  | "salaryMin"
  | "salaryMax"
  | "location"
  | "applicationDeadline"
  | "application";

export interface JobPostingAiResult {
  companyName: string;
  title: string;
  category: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  tags: string[];
  jobCategory: string;
  seniorityLevel: string;
  jobType: string;
  workMode: string;
  experienceLevel: string;
  educationLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryConfidence: number;
  location: string;
  slug: string;
  metaDescription: string;
  suggestedFields: string[];
  description: string;
  requirementsText: string;
  applicationDeadline: string;
  applicationMethod: "external_link" | "email" | "whatsapp";
  applicationUrl: string;
}

export interface JobPostingAiGenerateRequest {
  input: string;
  location?: string;
}
