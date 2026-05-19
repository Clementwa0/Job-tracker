import axiosInstance from "@/lib/axiosInstance";
import type { CVFeedback } from "@/types/resume.types";

export interface ReviewCvDto {
  cvText: string;
}

export const cvService = {
  async reviewCv(payload: ReviewCvDto): Promise<CVFeedback> {
    const { data } = await axiosInstance.post<CVFeedback>("/cv", payload);
    return data;
  },
};
