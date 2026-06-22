import axiosInstance from "@/lib/axiosInstance";

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  jobTitle?: string;
  location?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
  resetPath?: string;
}

export interface ResetPasswordDto {
  password: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  /* ---------- JWT AUTH ---------- */

  async register(data: RegisterRequest) {
    const r = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data
    );

    return r.data;
  },

  async login(data: LoginRequest) {
    const r = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      data
    );

    return r.data;
  },

  async logout() {
    await axiosInstance.post("/auth/logout");
  },

  async getCurrentUser() {
    const r = await axiosInstance.get<AuthResponse>("/auth/me");
    return r.data;
  },

  async updateProfile(data: UpdateProfileDto) {
    const r = await axiosInstance.patch<{
      success: true;
      data: { user: User };
    }>("/auth/me", data);

    return r.data;
  },

  async changePassword(data: ChangePasswordDto) {
    await axiosInstance.post("/auth/change-password", data);
  },

  async forgotPassword(data: ForgotPasswordDto) {
    await axiosInstance.post("/auth/forgot-password", data);
  },

  async resetPassword(
    token: string,
    data: ResetPasswordDto
  ) {
    await axiosInstance.post(
      `/auth/reset-password/${token}`,
      data
    );
  },

  async verifyEmail(token: string) {
    await axiosInstance.get(`/auth/verify-email/${token}`);
  },

  async listSessions() {
    const r = await axiosInstance.get("/auth/sessions");
    return r.data;
  },

  async revokeSession(id: string) {
    await axiosInstance.delete(`/auth/sessions/${id}`);
  },

  /* ---------- AUTHJS SOCIAL LOGIN ---------- */

  loginWithGoogle() {
    window.location.href = `${API_URL}/auth/social/google`;
  },

  loginWithGithub() {
    window.location.href = `${API_URL}/auth/social/github`;
  },
};