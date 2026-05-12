import { apiClient } from "@/lib/api/api-client";
import { tokenStorage } from "@/lib/storage/token-storage";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MeResponse,
} from "./auth-types";

// ─── AUTH ─────────────────────────────────────

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/register", data);
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>("/auth/login", data);
}

export async function getCurrentUser(): Promise<MeResponse> {
  return apiClient.get<MeResponse>("/auth/me");
}

// ─── PASSWORD RESET ───────────────────────────

export async function forgotPassword(email: string) {
  return apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  return apiClient.post(`/auth/reset-password/${token}`, { password });
}

// ─── TOKEN STORAGE ────────────────────────────

export { tokenStorage };