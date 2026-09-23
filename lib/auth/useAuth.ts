import { tokenStorage } from "@/lib/security/tokenStorage";
import axiosInstance from "../axiosInstance";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
};

export type AuthResponse = {
  user: AuthUser;
  token?: string;
};

export const authService = {
  async me(): Promise<AuthUser> {
    const { data } = await axiosInstance.get("/auth/me");
    return data.data?.user ?? data.user ?? data;
  },

  async googleSignIn(idToken: string): Promise<AuthResponse> {
    const { data } = await axiosInstance.post("/auth/google", { idToken });
    const token = data.data?.token ?? data.token;
    if (token) tokenStorage.setToken(token);
    return {
      user: data.data?.user ?? data.user ?? data,
      token,
    };
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      tokenStorage.removeToken();
    }
  },

  async refresh(): Promise<string> {
    const { data } = await axiosInstance.post("/auth/refresh");
    const token = data.data?.token ?? data.token;
    if (token) tokenStorage.setToken(token);
    return token as string;
  },
};