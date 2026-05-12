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

export type AuthResponse = ApiResponse<AuthData>;

export type MeResponse = ApiResponse<{ user: User }>;