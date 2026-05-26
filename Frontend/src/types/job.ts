import type { Interview } from "./interview";

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "waiting_response"
  | "ghosted"
  | "completed";

export type JobPriority = "low" | "medium" | "high" | "urgent";
export type WorkMode = "remote" | "onsite" | "hybrid" | "";

export const applicationStatusColors: Record<ApplicationStatus, string> = {
  applied: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30",
  interviewing: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-400/30",
  offer: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-400/30",
  rejected: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-400/30",
  waiting_response: "bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-400/30",
  ghosted: "bg-stone-500/15 text-stone-600 dark:text-stone-300 border-stone-400/30",
  completed: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-400/30",
};

export const priorityColors: Record<JobPriority, string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  medium: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  urgent: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
};

export interface JobAttachment {
  _id?: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
}

export interface JobActivity {
  _id?: string;
  type?: "note" | "status" | "reminder" | "system";
  message: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
}

export interface JobReminder {
  _id?: string;
  title: string;
  dueAt: string;
  done?: boolean;
}

export interface MatchAnalysis {
  strengths?: string[];
  gaps?: string[];
  keywords?: { matched?: string[]; missing?: string[] };
  suggestions?: string[];
  summary?: string;
}

export interface BackendJob {
  _id: string;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  jobType?: string;
  workMode?: WorkMode;
  applicationDate?: string | Date;
  applicationDeadline?: string | Date;
  source?: string;
  applicationStatus?: string;
  priority?: JobPriority;
  tags?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryRange?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  recruiterLinkedIn?: string;
  resumeFile?: string | null;
  coverLetterFile?: string | null;
  attachments?: JobAttachment[];
  jobPostingUrl?: string;
  jobDescription?: string;
  matchScore?: number | null;
  matchAnalysis?: MatchAnalysis | null;
  notes?: string;
  activity?: JobActivity[];
  reminders?: JobReminder[];
  isArchived?: boolean;
  interviews?: Interview[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  location: string;
  jobType: string;
  workMode: WorkMode;
  salaryRange: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  applicationDate: string;
  applicationDeadline: string;
  applicationStatus: string;
  priority: JobPriority;
  tags: string[];
  resumeFile: string | File | null;
  coverLetterFile: string | null;
  attachments: JobAttachment[];
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  recruiterLinkedIn: string;
  jobPostingUrl: string;
  jobDescription: string;
  matchScore: number | null;
  matchAnalysis: MatchAnalysis | null;
  notes: string;
  source: string;
  activity: JobActivity[];
  reminders: JobReminder[];
  isArchived: boolean;
  interviews: Interview[];
  createdAt?: string;
  updatedAt?: string;
}

export type JobPayload = Omit<Job, "id" | "interviews" | "activity"> & {
  interviews?: Interview[];
};

export interface JobFilters {
  q?: string;
  status?: ApplicationStatus[] | string[];
  company?: string;
  jobType?: string[];
  workMode?: WorkMode[];
  priority?: JobPriority[];
  tag?: string[];
  from?: string;
  to?: string;
  minSalary?: number;
  maxSalary?: number;
  archived?: "true" | "false" | "all";
}
