import type { ApplicationStatus, Interview } from "./shared";

export interface BackendJob {
  _id: string;
  jobTitle: string;
  companyName: string;

  location?: string;
  jobType?: string;

  applicationDate?: string;
  applicationDeadline?: string;

  source?: string;

  applicationStatus?: ApplicationStatus;

  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;

  resumeFile?: string;
  coverLetterFile?: string;

  jobPostingUrl?: string;
  salaryRange?: string;

  notes?: string;

  interviews?: Interview[];
}