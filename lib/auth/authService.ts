import axiosInstance from "@/lib/axiosInstance";
import type { AuthResponse } from "@/types/auth";

export const authService = {
  /** Signs in a jobseeker with Google, creating the account on first sign-in. */
  async googleSignIn(idToken: string) {
    const r = await axiosInstance.post<AuthResponse>("/auth/google", { idToken });
    return r.data;
  },

  async logout() {
    await axiosInstance.post("/auth/logout");
  },
};
