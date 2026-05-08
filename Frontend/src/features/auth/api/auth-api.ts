import { apiClient, tokenStorage } from "@/lib/api-client";
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

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/register", data);
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", data);
}

export async function getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
  return apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
}

export async function forgotPassword(email: string): Promise<ApiResponse<unknown>> {
  return apiClient.post<ApiResponse<unknown>>("/auth/forgot-password", { email });
}

export async function resetPassword(
  token: string,
  password: string
): Promise<ApiResponse<unknown>> {
  return apiClient.post<ApiResponse<unknown>>(`/auth/reset-password/${token}`, {
    password,
  });
}

export { tokenStorage };
