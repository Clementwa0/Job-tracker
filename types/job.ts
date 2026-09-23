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
  applied: "bg-muted text-muted-foreground border-border",
  interviewing: "bg-primary/10 text-primary border-primary/25 dark:text-primary",
  offer: "bg-gold/15 text-gold-foreground border-gold/30 dark:text-gold",
  rejected: "bg-destructive/10 text-destructive border-destructive/25",
  waiting_response: "bg-secondary text-secondary-foreground border-border",
  ghosted: "bg-muted text-muted-foreground/70 border-border",
  completed: "bg-primary/15 text-primary border-primary/30 dark:text-primary",
};

export const priorityColors: Record<JobPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-secondary text-secondary-foreground",
  high: "bg-gold/15 text-gold-foreground dark:text-gold",
  urgent: "bg-destructive/10 text-destructive",
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
  /** First time an employer really responded (interviewing / offer / rejected); never cleared. */
  respondedAt?: string;
  offerAt?: string;
  interviews?: Interview[];
  userId?: string;
  jobPostingId?: string;
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
  coverLetterFile: string | File | null;
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
  /** First time an employer really responded; set by the server, never cleared. */
  respondedAt?: string;
  offerAt?: string;
  interviews: Interview[];
  jobPostingId?: string;
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
  jobPostingId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface JobsListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AnalyticsSummary {
  version: number;
  generatedAt: string;
  metrics: {
    totalJobs: number;
    statusCounts: Record<string, number>;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    activeApplications: number;
    interviewCount: number;
    offerCount: number;
    rejectedCount: number;
  };
  charts: {
    status: { key: string; status: string; count: number }[];
    companies: { company: string; count: number }[];
    locations: { location: string; count: number }[];
    jobTypes: { type: string; count: number }[];
    timeline: { date: string; count: number }[];
  };
}


/** Counts of events inside one 7-day window (see lib/jobs/statsMath.ts). */
export interface JobStatsWindowCounts {
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
}

/** Response of `GET /api/jobs/stats` — everything the dashboard stat cards show. */
export interface JobStats {
  /** Non-archived applications. */
  total: number;
  statusCounts: Record<string, number>;
  /** Applications the employer has ever really responded to (interviewing / offer / rejected). */
  responseCount: number;
  /** responseCount / total, as a percentage with one decimal. */
  responseRate: number;
  /** Interviews currently scheduled or rescheduled. */
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  window: { days: number; currentStart: string; previousStart: string; end: string };
  /** Last 7 days. */
  current: JobStatsWindowCounts;
  /** The 7 days before that. */
  previous: JobStatsWindowCounts;
  /** % change previous → current; null when there's no previous baseline. */
  trends: Record<keyof JobStatsWindowCounts, number | null>;
}
