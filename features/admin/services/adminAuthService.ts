import axiosInstance from "@/lib/axiosInstance";
import type { AuthResponse, LoginRequest } from "@/types/auth";

export const adminAuthService = {
  async login(data: LoginRequest) {
    const r = await axiosInstance.post<AuthResponse>("/admin/login", data);
    return r.data;
  },

  async logout() {
    await axiosInstance.post("/auth/logout");
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await axiosInstance.post("/admin/change-password", { currentPassword, newPassword });
  },
};
