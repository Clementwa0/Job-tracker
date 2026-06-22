import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AdminAnalytics,
  AdminAnalyticsCharts,
  AdminAnalyticsOverview,
  AdminAnalyticsPeriod,
  AdminCompany,
  AdminJobPosting,
  AdminUser,
  AuditLogEntry,
  PaginatedMeta,
} from "@/types/admin";

export interface ListUsersParams {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ListJobsParams {
  status?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface ListCompaniesParams {
  status?: string;
  page?: number;
  limit?: number;
}

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AdminAnalytics>>("/admin/analytics");
    return data.data;
  },

  async getAnalyticsOverview(): Promise<AdminAnalyticsOverview> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AdminAnalyticsOverview>>(
      "/admin/analytics/overview",
    );
    return data.data;
  },

  async getAnalyticsCharts(period: AdminAnalyticsPeriod = "30d"): Promise<AdminAnalyticsCharts> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AdminAnalyticsCharts>>(
      "/admin/analytics/charts",
      { params: { period } },
    );
    return data.data;
  },

  async listUsers(params?: ListUsersParams) {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AdminUser[]> & { meta: PaginatedMeta }>(
      "/admin/users",
      { params },
    );
    return { users: data.data ?? [], meta: data.meta };
  },

  async updateUserStatus(id: string, status: "active" | "suspended") {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminUser>>(
      `/admin/users/${id}/status`,
      { status },
    );
    return data.data;
  },

  async updateUserRole(id: string, role: "user" | "employer" | "admin") {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminUser>>(
      `/admin/users/${id}/role`,
      { role },
    );
    return data.data;
  },

  async listJobs(params?: ListJobsParams) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<AdminJobPosting[]> & { meta: PaginatedMeta }
    >("/admin/jobs", { params });
    return { jobs: data.data ?? [], meta: data.meta };
  },

  async approveJob(id: string) {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminJobPosting>>(
      `/admin/jobs/${id}/approve`,
    );
    return data.data;
  },

  async rejectJob(id: string, reason?: string) {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminJobPosting>>(
      `/admin/jobs/${id}/reject`,
      { reason },
    );
    return data.data;
  },

  async closeJob(id: string) {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminJobPosting>>(
      `/admin/jobs/${id}/close`,
    );
    return data.data;
  },

  async listCompanies(params?: ListCompaniesParams) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<AdminCompany[]> & { meta: PaginatedMeta }
    >("/admin/companies", { params });
    return { companies: data.data ?? [], meta: data.meta };
  },

  async updateCompanyStatus(id: string, status: "pending" | "approved" | "suspended") {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<AdminCompany>>(
      `/admin/companies/${id}/status`,
      { status },
    );
    return data.data;
  },

  async listAuditLogs(params?: { page?: number; limit?: number }) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<AuditLogEntry[]> & { meta: PaginatedMeta }
    >("/admin/audit-logs", { params });
    return { logs: data.data ?? [], meta: data.meta };
  },
};
