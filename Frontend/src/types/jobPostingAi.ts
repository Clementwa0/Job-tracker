export type JobPostingAiFieldKey =
  | "title"
  | "description"
  | "requirements"
  | "tags"
  | "jobType"
  | "workMode"
  | "salaryMin"
  | "salaryMax"
  | "location";

export interface JobPostingAiResult {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  tags: string[];
  jobCategory: string;
  seniorityLevel: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryConfidence: number;
  location: string;
  slug: string;
  metaDescription: string;
  suggestedFields: string[];
  description: string;
  requirementsText: string;
}

export interface JobPostingAiGenerateRequest {
  input: string;
  location?: string;
}
