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
  description: string;
  requirements?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType: string;
  workMode: string;
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

export interface EmployerDashboardData {
  hasCompany: boolean;
  company?: EmployerCompany;
  stats: {
    totalJobs: number;
    published: number;
    drafts: number;
    pendingReview: number;
    closed: number;
    totalViews: number;
  };
  recentPostings: EmployerJobPosting[];
}

export interface EmployerJobPayload {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  jobType: string;
  workMode: string;
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
  total: number;
  totalPages: number;
}
