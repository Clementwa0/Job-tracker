import axiosInstance from "@/lib/axiosInstance";
import type { AuthResponse, LoginRequest } from "@/types/auth";

export interface EmployerRegisterRequest {
  companyName: string;
  email: string;
  password: string;
  industry?: string;
  location?: string;
  website?: string;
  description?: string;
}

export const employerAuthService = {
  async register(data: EmployerRegisterRequest) {
    const r = await axiosInstance.post<AuthResponse>("/employer/register", data);
    return r.data;
  },

  async login(data: LoginRequest) {
    const r = await axiosInstance.post<AuthResponse>("/employer/login", data);
    return r.data;
  },

  async forgotPassword(email: string) {
    await axiosInstance.post("/employer/forgot-password", { email });
  },
};
