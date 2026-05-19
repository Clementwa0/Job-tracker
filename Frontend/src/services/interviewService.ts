import axiosInstance from "@/lib/axiosInstance";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  CreateInterviewRequest,
  Interview,
} from "@/types/interview";

export const interviewService = {
  async getInterviews(): Promise<Interview[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<Interview[]>>(
      "/interviews",
    );
    return data.data;
  },

  async getJobInterviews(jobId: string): Promise<Interview[]> {
    const { data } = await axiosInstance.get<ApiSuccessResponse<Interview[]>>(
      `/interviews/job/${jobId}`,
    );
    return data.data;
  },

  async createInterview(
    payload: CreateInterviewRequest,
  ): Promise<Interview> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<Interview>>(
      "/interviews",
      payload,
    );
    return data.data;
  },

  async updateInterview(
    id: string,
    payload: Partial<CreateInterviewRequest>,
  ): Promise<Interview> {
    const { data } = await axiosInstance.put<ApiSuccessResponse<Interview>>(
      `/interviews/${id}`,
      payload,
    );
    return data.data;
  },

  async deleteInterview(id: string): Promise<string> {
    const { data } = await axiosInstance.delete<
      ApiSuccessResponse<{ message: string }>
    >(`/interviews/${id}`);
    return data.message ?? "Interview deleted";
  },
};
