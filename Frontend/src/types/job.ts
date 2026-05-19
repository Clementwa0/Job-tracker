import type { Interview } from "./interview";

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "waiting response"
  | "ghosted"
  | "accepted"
  | "completed";

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  applied: "bg-slate-500/10 text-slate-700 dark:text-slate-400",      
  interviewing: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  offer: "bg-green-800 text-amber-700 dark:text-amber-100",     
  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "waiting response": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  ghosted: "bg-stone-500/10 text-stone-600 dark:text-stone-400",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  completed: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
};

export interface BackendJob {
  _id: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobType?: string;
  applicationDate?: string | Date;
  applicationDeadline?: string | Date;
  source?: string;
  applicationStatus?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  resumeFile?: string | null;
  jobPostingUrl?: string;
  salaryRange?: string;
  notes?: string;
  interviews?: Interview[];
  userId?: string;
}

export interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  salaryRange: string;
  applicationDate: string;
  applicationDeadline: string;
  applicationStatus: string;
  resumeFile: string | File | null; // Updated to allow File object if your form handles uploads directly
  contactEmail: string;
  contactPhone: string;
  jobPostingUrl: string;
  notes: string;
  contactPerson: string;
  source: string;
  interviews: Interview[];
}

export type JobPayload = Omit<Job, "id" | "interviews"> & {
  interviews?: Interview[];
};