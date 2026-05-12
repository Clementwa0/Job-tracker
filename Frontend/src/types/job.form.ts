import type { ApplicationStatus, Interview } from "./shared";

export interface JobForm {
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;

  applicationDate: string;
  applicationDeadline: string;

  source: string;

  applicationStatus: ApplicationStatus;

  contactPerson: string;
  contactEmail: string;
  contactPhone: string;

  resumeFile: File | null;
  coverLetterFile: File | null;

  jobPostingUrl: string;
  salaryRange: string;

  notes: string;

  interviews: Interview[];
}