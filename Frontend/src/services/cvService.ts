import axiosInstance from "@/lib/axiosInstance";

import type {
  CVFeedback,
  ReviewCvDto,
} from "@/types/resume.types";

export const cvService = {
  async reviewCv(payload: ReviewCvDto): Promise<CVFeedback> {
    const { data } = await axiosInstance.post<CVFeedback>(
      "/cv",
      payload
    );

    return data;
  },
};