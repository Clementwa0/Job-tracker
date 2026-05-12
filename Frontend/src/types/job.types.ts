import type { ApplicationStatus } from "./shared";

export interface JobCardProps {
  notes: string | number | readonly string[];
  contactPerson: string | number | readonly string[];
  contactEmail: string | number | readonly string[];
  contactPhone: string | number | readonly string[];
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange: string;
  applicationDate: string;
  applicationDeadline: string;
  resumeFile: string | null;
  status: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

/** Normalized job for UI lists, calendar, and cards */
export type Job = JobCardProps;

export interface Interview {
  date: string;
  notes: string;
  type: string;
}

export interface JobApplication {
  source: string;
  applicationStatus: string;
  jobPostingUrl: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  resumeFile: File | null;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  applicationDate: string;
  applicationDeadline: string;
  salaryRange: string;
  notes: string;
  interviews: Interview[];
}
export interface JobsFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}
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

