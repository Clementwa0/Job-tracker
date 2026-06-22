export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "employer" | "admin";
  accountStatus: "active" | "suspended";
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  location?: string;
  industry?: string;
  status: "pending" | "approved" | "suspended";
  createdBy: string;
  createdAt?: string;
}

export interface AdminJobPosting {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  status: string;
  location?: string;
  jobType?: string;
  workMode?: string;
  viewCount: number;
  publishedAt?: string;
  createdBy: string;
  createdAt?: string;
  company?: { id: string; name: string; slug: string };
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminAnalytics {
  users: { total: number; byRole: Record<string, number>; suspended: number };
  jobPostings: {
    total: number;
    byStatus: Record<string, number>;
    pendingReview: number;
    totalViews: number;
  };
  companies: { total: number; byStatus: Record<string, number>; pending: number };
  trackerJobs: number;
  recentAuditLogs: AuditLogEntry[];
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TrendCounts {
  month: number;
  week: number;
  today: number;
}

export interface AdminAnalyticsOverview {
  totalUsers: number;
  totalEmployers: number;
  totalCompanies: number;
  totalJobs: number;
  publishedJobs: number;
  pendingJobs: number;
  draftJobs: number;
  closedJobs: number;
  trends: {
    users: TrendCounts;
    employers: TrendCounts;
    companies: TrendCounts;
    jobs: TrendCounts;
  };
}

export type AdminAnalyticsPeriod = "7d" | "30d" | "90d" | "12m" | "all";

export interface AdminAnalyticsCharts {
  period: AdminAnalyticsPeriod;
  jobStatusDistribution: { name: string; value: number; status: string }[];
  jobsOverTime: { date: string; count: number }[];
  userGrowth: { period: string; count: number }[];
  employerGrowth: { period: string; count: number }[];
  topCategories: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
}
