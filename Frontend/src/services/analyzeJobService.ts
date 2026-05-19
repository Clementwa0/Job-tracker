import axiosInstance from "@/lib/axiosInstance";
import type { Job } from "@/types/job";

export interface AnalyzeJobDto {
  description: string;
}

export const analyzeJobService = {
  async analyze(payload: AnalyzeJobDto): Promise<Partial<Job>> {
    const { data } = await axiosInstance.post<Partial<Job>>(
      "/analyze-job",
      payload,
    );
    return data;
  },
};
