import { env } from "@/config/env";

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiClientError extends Error {
  statusCode?: number;
  errors?: ApiError["errors"];

  constructor(message: string, statusCode?: number, errors?: ApiError["errors"]) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const getAuthHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
    throw new ApiClientError(err.message || "Something went wrong", response.status, err.errors);
  }

  return data as T;
}

export const apiClient = {
  get: async <T>(endpoint: string) => {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(res);
  },

  post: async <T>(endpoint: string, body?: unknown) => {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  put: async <T>(endpoint: string, body?: unknown) => {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(endpoint: string) => {
    const res = await fetch(`${env.apiBaseUrl}${endpoint}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(res);
  },
};