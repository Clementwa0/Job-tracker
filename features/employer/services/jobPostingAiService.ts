import axiosInstance from "@/lib/axiosInstance";
import type { JobPostingAiGenerateRequest, JobPostingAiResult } from "@/types/jobPostingAi";

export const jobPostingAiService = {
  async generate(payload: JobPostingAiGenerateRequest): Promise<JobPostingAiResult> {
    const { data } = await axiosInstance.post<{ success: boolean; data: JobPostingAiResult }>(
      "/employer/jobs/ai-generate",
      payload,
    );
    return data.data;
  },
};
