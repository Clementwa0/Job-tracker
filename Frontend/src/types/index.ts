/**
 * Centralized type definitions for the Job Tracker application.
 * Single source of truth - eliminates type fragmentation across components.
 */

// ─── Application Status ────────────────────────────────────────────────────
export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "accepted"
  | "waiting_response"
  | "ghosted";

// ─── Interview ──────────────────────────────────────────────────────────────
export interface Interview {
  date: string;
  type: string;
  notes: string;
}

// ─── Job (Frontend/UI model) ───────────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salaryRange: string;
  applicationDate: string;
  applicationDeadline: string;
  status: ApplicationStatus | string;
  resumeFile: string | null;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  jobPostingUrl: string;
  source: string;
  notes: string;
  interviews: Interview[];
  nextStepsDate?: string;
}

// ─── Backend API Job (snake_case from MongoDB) ───────────────────────────────
export interface BackendJob {
  _id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  jobType?: string;
  applicationDate?: string;
  applicationDeadline?: string;
  source?: string;
  applicationStatus?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  resumeFile?: string;
  coverLetterFile?: string;
  jobPostingUrl?: string;
  salaryRange?: string;
  notes?: string;
  nextStepsDate?: string;
  interviews?: Array<{ date: string; type: string; notes: string }>;
}

// ─── API Response wrappers ──────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface JobsListResponse {
  jobs: BackendJob[];
}

export interface JobResponse {
  job: BackendJob;
}

// ─── User & Auth ────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthData {
  user: User;
  token: string;
}
