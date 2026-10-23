import type { ApplyMethod } from "@/types/jobPosting";

export type PostingStatus = "draft" | "pending_review" | "published" | "closed";
export type CompanyStatus = "pending" | "approved" | "suspended";

export interface EmployerCompany {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  status: CompanyStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployerJobPosting {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  category?: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType: string;
  workMode: string;
  experienceLevel?: string;
  educationLevel?: string;
  certifications?: string;
  tags: string[];
  applyMethod: ApplyMethod;
  status: PostingStatus;
  publishedAt?: string;
  closedAt?: string;
  applicationDeadline?: string | null;
  viewCount: number;
  createdAt?: string;
  updatedAt?: string;
  company?: { id: string; name: string; slug: string };
}

/**
 * Posting counts. `published` means live: status "published" and the
 * application deadline hasn't passed. Published postings past their deadline
 * are counted in `expired`, so
 * totalJobs = published + expired + drafts + pendingReview + closed.
 */
export interface EmployerPostingStats {
  totalJobs: number;
  published: number;
  expired: number;
  drafts: number;
  pendingReview: number;
  closed: number;
  totalViews: number;
  /** Live postings whose deadline falls within the next 7 days. */
  closingSoon: number;
  /** Mean views per live posting, rounded; 0 when nothing is live. */
  avgViewsPerLivePosting: number;
}

export interface EmployerTopPosting {
  id: string;
  title: string;
  status: PostingStatus;
  viewCount: number;
}

export interface EmployerDashboardData {
  hasCompany: boolean;
  company?: EmployerCompany;
  stats: EmployerPostingStats;
  /** Highest-viewed postings (views > 0), most viewed first. */
  topPostings: EmployerTopPosting[];
  recentPostings: EmployerJobPosting[];
}

export interface EmployerJobPayload {
  companyName: string;
  title: string;
  category?: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  jobType: string;
  workMode: string;
  experienceLevel?: string;
  educationLevel?: string;
  certifications?: string;
  tags?: string[];
  applyMethod: ApplyMethod;
  applicationDeadline?: string | null;
}

export interface CompanyPayload {
  name: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
}

export interface EmployerJobsMeta {
  page: number;
  limit: number;
  /** Postings matching the current status + search filters. */
  total: number;
  totalPages: number;
}

/** Per-status totals for the whole account (ignores the active filters). */
export type EmployerStatusCounts = Record<"all" | PostingStatus, number>;

export interface EmployerJobsList {
  jobs: EmployerJobPosting[];
  meta: EmployerJobsMeta;
  counts: EmployerStatusCounts;
  totalViews: number;
}

export interface EmployerJobsQuery {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}
