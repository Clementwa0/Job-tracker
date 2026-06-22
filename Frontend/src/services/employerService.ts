import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  CompanyPayload,
  EmployerCompany,
  EmployerDashboardData,
  EmployerJobPayload,
  EmployerJobPosting,
  EmployerJobsMeta,
} from "@/types/employer";

export const employerService = {
  async getDashboard(): Promise<EmployerDashboardData> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<EmployerDashboardData>>(
      "/employer/dashboard",
    );
    return data.data;
  },

  async getCompany(): Promise<EmployerCompany> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<EmployerCompany>>(
      "/employer/company",
    );
    return data.data;
  },

  async createCompany(payload: CompanyPayload): Promise<EmployerCompany> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<EmployerCompany>>(
      "/employer/company",
      payload,
    );
    return data.data;
  },

  async updateCompany(payload: Partial<CompanyPayload>): Promise<EmployerCompany> {
    const { data } = await axiosInstance.put<ApiSuccessResponse<EmployerCompany>>(
      "/employer/company",
      payload,
    );
    return data.data;
  },

  async listJobs(params?: { status?: string; page?: number; limit?: number }) {
    const { data } = await axiosInstance.get<
      ApiSuccessResponse<EmployerJobPosting[]> & { meta: EmployerJobsMeta }
    >("/employer/jobs", { params });
    return { jobs: data.data ?? [], meta: data.meta };
  },

  async getJob(id: string): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<EmployerJobPosting>>(
      `/employer/jobs/${id}`,
    );
    return data.data;
  },

  async createJob(payload: EmployerJobPayload): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<EmployerJobPosting>>(
      "/employer/jobs",
      payload,
    );
    return data.data;
  },

  async updateJob(id: string, payload: Partial<EmployerJobPayload>): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.put<ApiSuccessResponse<EmployerJobPosting>>(
      `/employer/jobs/${id}`,
      payload,
    );
    return data.data;
  },

  async publishJob(id: string): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<EmployerJobPosting>>(
      `/employer/jobs/${id}/publish`,
    );
    return data.data;
  },

  async unpublishJob(id: string): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<EmployerJobPosting>>(
      `/employer/jobs/${id}/unpublish`,
    );
    return data.data;
  },

  async closeJob(id: string): Promise<EmployerJobPosting> {
    const { data } = await axiosInstance.patch<ApiSuccessResponse<EmployerJobPosting>>(
      `/employer/jobs/${id}/close`,
    );
    return data.data;
  },

  async deleteJob(id: string): Promise<void> {
    await axiosInstance.delete(`/employer/jobs/${id}`);
  },
};
