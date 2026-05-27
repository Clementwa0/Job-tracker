import axiosInstance from "@/lib/axiosInstance";

import type {
  CVFeedback,
} from "@/types/resume.types";

export const cvService = {
  async reviewCv(payload: any): Promise<CVFeedback> {
    const { data } = await axiosInstance.post<CVFeedback>(
      "/cv",
      payload
    );

    return data;
  },
};