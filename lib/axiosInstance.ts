import axios from "axios";
import { authEvents } from "@/lib/auth/authEvents";
import {
  API_URL,
  clearAccessToken,
  getAccessToken,
  refreshSession,
} from "@/lib/auth/session";

/** The one API client. Attaches the access token and handles 401 -> refresh -> retry. */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** Endpoints where a 401 means "bad credentials/no session", not "expired token". */
function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/google") ||
    url.includes("/admin/login")
  );
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      // A rejected login must not be reported as an expired session, and a
      // request that already retried once must not loop.
      if (originalRequest && !isAuthEndpoint(originalRequest.url)) {
        clearAccessToken();
        authEvents.emitUnauthorized();
      }
      return Promise.reject(error);
    }

    // Retry at most once per request (_retry), so a persistent 401 can never loop.
    originalRequest._retry = true;

    try {
      // Single-flight: concurrent 401s share one refresh call.
      const { token } = await refreshSession();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch {
      clearAccessToken();
      authEvents.emitUnauthorized();
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;

declare module "axios" {
  export interface AxiosRequestConfig {
    _retry?: boolean;
  }
}
