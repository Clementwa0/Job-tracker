export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: Array<{ msg?: string; message?: string; field?: string; path?: string }>;
  error?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiError(
  response: ApiResponse<unknown>,
): response is ApiErrorResponse {
  return response.success === false;
}