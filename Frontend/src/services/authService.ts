import axiosInstance from "@/lib/axiosInstance";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import type { ApiSuccessResponse } from "@/types/api";

export interface UpdateProfileDto {
  name?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
}

export const authService = {
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      userData,
    );
    return data;
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      credentials,
    );
    return data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const { data } = await axiosInstance.get<AuthResponse>("/auth/me");
    return data;
  },

  async updateProfile(userData: UpdateProfileDto): Promise<AuthResponse> {
    const { data } = await axiosInstance.put<AuthResponse>(
      "/auth/profile",
      userData,
    );
    return data;
  },

  async changePassword(payload: ChangePasswordDto): Promise<ApiSuccessResponse<null>> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<null>>(
      "/auth/change-password",
      payload,
    );
    return data;
  },

  async forgotPassword(payload: ForgotPasswordDto): Promise<ApiSuccessResponse<null>> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<null>>(
      "/auth/forgot-password",
      payload,
    );
    return data;
  },

  async resetPassword(
    token: string,
    payload: ResetPasswordDto,
  ): Promise<ApiSuccessResponse<null>> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<null>>(
      `/auth/reset-password/${token}`,
      payload,
    );
    return data;
  },

  async logout(): Promise<ApiSuccessResponse<null>> {
    const { data } = await axiosInstance.post<ApiSuccessResponse<null>>(
      "/auth/logout",
    );
    return data;
  },
};
