/**
 * Centralized API client - single source for all HTTP requests.
 * Replaces dual api.ts + axios.ts with typed, consistent fetch-based client.
 */

import { env } from "@/config/env";

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiClientError extends Error {
  public statusCode?: number;
  public errors?: ApiError["errors"];

  constructor(
    message: string,
    statusCode?: number,
    errors?: ApiError["errors"]
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function handleResponse<T>(response: Response): Promise<T> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiClientError("Invalid JSON response", response.status);
  }

  if (!response.ok) {
    const err = data as ApiError;
    throw new ApiClientError(
      err.message || "Something went wrong",
      response.status,
      err.errors
    );
  }

  return data as T;
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(res);
  },

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(res);
  },
};

export const tokenStorage = {
  set: (token: string) => localStorage.setItem("token", token),
  remove: () => localStorage.removeItem("token"),
  get: () => localStorage.getItem("token"),
  has: () => !!localStorage.getItem("token"),
};

/**
 * Axios-compatible API wrapper for gradual migration.
 * Returns { data } to match axios response shape.
 */
export const api = {
  async get<T>(path: string) {
    const data = await apiClient.get<T>(path);
    return { data };
  },
  async post<T>(path: string, body?: unknown) {
    const data = await apiClient.post<T>(path, body);
    return { data };
  },
  async put<T>(path: string, body?: unknown) {
    const data = await apiClient.put<T>(path, body);
    return { data };
  },
  async delete<T>(path: string) {
    const data = await apiClient.delete<T>(path);
    return { data };
  },
};
