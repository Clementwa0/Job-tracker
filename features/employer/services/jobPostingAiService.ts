import axiosInstance from "@/lib/axiosInstance";
import type {
  JobPostingAiGenerateRequest,
  JobPostingAiResult,
} from "@/types/jobPostingAi";

interface JobPostingAiGenerateResponse {
  success: boolean;
  data: JobPostingAiResult;
  message?: string;
}

export const jobPostingAiService = {
  async generate(
    payload: JobPostingAiGenerateRequest,
  ): Promise<JobPostingAiResult> {
    const { data } =
      await axiosInstance.post<JobPostingAiGenerateResponse>(
        "/employer/jobs/ai-generate",
        payload,
      );

    if (!data.success) {
      throw new Error(
        data.message ||
          "Unable to generate job posting.",
      );
    }

    return data.data;
  },
};