import { tokenStorage } from "@/lib/storage/token-storage";
import {
  login as authLogin,
  getCurrentUser as authGetCurrentUser,
  register as authRegisterApi,
} from "@/lib/auth/auth-api";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterRequest) => {
    return authRegisterApi(data);
  },

  login: authLogin,
  getCurrentUser: authGetCurrentUser,

  setToken: tokenStorage.set,
  removeToken: tokenStorage.remove,
  getToken: tokenStorage.get,
  isAuthenticated: tokenStorage.has,
};