import axiosInstance from "@/lib/axiosInstance";

export interface Tip {
  title: string;
  description: string;
  category?: string;
}

export const tipService = {
  async getDailyTip(): Promise<Tip> {
    const { data } = await axiosInstance.get<Tip>("/tip");
    return data;
  },
};
