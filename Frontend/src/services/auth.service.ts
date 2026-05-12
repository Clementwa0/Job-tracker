import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, AuthData, User } from "@/types";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: AuthData;
}

export const authService = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>("/auth/register", data),

  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  me: () =>
    apiClient.get<ApiResponse<{ user: User }>>("/auth/me"),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<unknown>>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<unknown>>(
      `/auth/reset-password/${token}`,
      { password }
    ),
};