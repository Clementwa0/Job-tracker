import axiosInstance from "@/lib/axiosInstance";
import { refreshSession, type RefreshResult } from "@/lib/auth/session";
import type { AuthResponse, LoginRequest } from "@/types/auth";

/**
 * The single client for the authentication API. Stateless: it never stores
 * anything - AuthContext owns the session and applies these results.
 */
export const authService = {
  /**
   * Google sign-in. One flow for both roles; the backend keeps a separate
   * endpoint per role so the account is created with the right role.
   */
  async googleSignIn(idToken: string, role: "user" | "employer") {
    const url = role === "employer" ? "/employer/auth/google" : "/auth/google";
    const r = await axiosInstance.post<AuthResponse>(url, { idToken });
    return r.data;
  },

  /** Admin email/password login (admins have their own account table). */
  async adminLogin(credentials: LoginRequest) {
    const r = await axiosInstance.post<AuthResponse>("/admin/login", credentials);
    return r.data;
  },

  async adminChangePassword(currentPassword: string, newPassword: string) {
    await axiosInstance.post("/admin/change-password", { currentPassword, newPassword });
  },

  /** Revokes the server session and clears the refresh cookie. */
  async logout() {
    await axiosInstance.post("/auth/logout");
  },

  /** Restores a session from the httpOnly refresh cookie (single-flight). */
  refresh(): Promise<RefreshResult> {
    return refreshSession();
  },
};
