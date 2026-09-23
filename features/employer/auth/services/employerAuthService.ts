import axiosInstance from "@/lib/axiosInstance";
import type { AuthResponse } from "@/types/auth";

export const employerAuthService = {
  /** Signs in an employer with Google, creating the account on first sign-in. */
  async googleSignIn(idToken: string) {
    const r = await axiosInstance.post<AuthResponse>("/employer/auth/google", { idToken });
    return r.data;
  },

  async logout() {
    await axiosInstance.post("/auth/logout");
  },
};
