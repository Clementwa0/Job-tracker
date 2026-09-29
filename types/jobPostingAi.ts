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
  | "location"
  | "salaryMin"
  | "salaryMax"
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

  // Kept for compatibility with existing AI responses/UI.
  jobCategory: string;
  seniorityLevel: string;

  jobType: string;
  workMode: string;

  /**
   * Preserve the actual source wording.
   *
   * Example:
   * "1–5 years"
   */
  experienceLevel: string;

  /**
   * Preserve the actual source wording.
   *
   * Example:
   * "BA/BSc/HND, Diploma, Vocational"
   */
  educationLevel: string;

  salaryMin: number | null;
  salaryMax: number | null;
  salaryConfidence: number;

  location: string;

  slug: string;
  metaDescription: string;

  suggestedFields: string[];

  /**
   * Ready-to-use form content.
   */
  description: string;
  requirementsText: string;

  /**
   * null means the source does not provide
   * an application deadline.
   */
  applicationDeadline: string | null;

  applicationMethod:
    | "external_link"
    | "email"
    | "whatsapp"
    | "";

  applicationUrl: string;
}

export interface JobPostingAiGenerateRequest {
  input: string;
  location?: string;
}