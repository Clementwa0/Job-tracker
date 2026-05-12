import { apiClient } from "./api-client";

/**
 * Axios-like wrapper to keep API responses consistent:
 * { data: T }
 */

export const api = {
  get: async <T>(path: string) => {
    const data = await apiClient.get<T>(path);
    return { data };
  },

  post: async <T>(path: string, body?: unknown) => {
    const data = await apiClient.post<T>(path, body);
    return { data };
  },

  put: async <T>(path: string, body?: unknown) => {
    const data = await apiClient.put<T>(path, body);
    return { data };
  },

  delete: async <T>(path: string) => {
    const data = await apiClient.delete<T>(path);
    return { data };
  },
};