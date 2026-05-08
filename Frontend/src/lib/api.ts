
import {
  login as authLogin,
  getCurrentUser as authGetCurrentUser,
  tokenStorage,
  type AuthResponse,
} from "@/features/auth/api/auth-api";

export type { AuthResponse };
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export const apiService = {
  register: async (userData: RegisterRequest) => {
    const { register } = await import("@/features/auth/api/auth-api");
    return register(userData);
  },
  login: authLogin,
  getCurrentUser: authGetCurrentUser,
  setToken: tokenStorage.set,
  removeToken: tokenStorage.remove,
  getToken: tokenStorage.get,
  isAuthenticated: tokenStorage.has,
};
