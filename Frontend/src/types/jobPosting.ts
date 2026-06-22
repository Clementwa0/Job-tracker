export type JobBoardWorkMode = "remote" | "hybrid" | "onsite";
export type JobBoardJobType = "full-time" | "part-time" | "contract" | "internship";
export type PublicJobSort = "newest" | "salary" | "relevance";
export type ApplyMethodType = "external_link" | "email" | "whatsapp";

export interface ApplyMethod {
  type: ApplyMethodType;
  value: string;
}

export interface PublicCompany {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  location?: string;
  industry?: string;
  website?: string;
  description?: string;
}

export type JobBoardStatus = "draft" | "pending_review" | "published" | "closed";

export interface PublicJobListItem {
  id: string;
  slug: string;
  title: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  jobType: JobBoardJobType;
  workMode: JobBoardWorkMode;
  tags: string[];
  publishedAt?: string;
  applicationDeadline?: string;
  status?: JobBoardStatus;
  isActive?: boolean;
  company?: PublicCompany;
}

export interface PublicJobDetail extends PublicJobListItem {
  description: string;
  requirements?: string;
  viewCount?: number;
  closedAt?: string;
  applyMethod: ApplyMethod;
}

export interface PublicJobFilters {
  q?: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  companyId?: string;
  tags?: string;
  sort?: PublicJobSort;
  page?: number;
  limit?: number;
}

export interface PublicJobsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
