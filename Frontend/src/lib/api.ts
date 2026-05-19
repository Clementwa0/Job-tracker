import { authService } from "@/services/authService";
import { interviewService } from "@/services/interviewService";
import { tokenStorage } from "@/lib/tokenStorage";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from "@/types/auth";
import type {
  CreateInterviewRequest,
  Interview,
} from "@/types/interview";

/**
 * Backward-compatible facade. Prefer importing services directly.
 */
class ApiService {
  register(userData: RegisterRequest): Promise<AuthResponse> {
    return authService.register(userData);
  }

  login(credentials: LoginRequest): Promise<AuthResponse> {
    return authService.login(credentials);
  }

  getCurrentUser(): Promise<AuthResponse> {
    return authService.getCurrentUser();
  }

  updateUserProfile(userData: { name?: string; email?: string }): Promise<AuthResponse> {
    return authService.updateProfile(userData);
  }

  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<unknown> {
    return authService.changePassword(data);
  }

  createInterview(data: CreateInterviewRequest): Promise<{ success: boolean; data: Interview }> {
    return interviewService.createInterview(data).then((interview) => ({
      success: true,
      data: interview,
    }));
  }

  getInterviews(): Promise<{ success: boolean; data: Interview[] }> {
    return interviewService.getInterviews().then((interviews) => ({
      success: true,
      data: interviews,
    }));
  }

  getJobInterviews(jobId: string): Promise<{ success: boolean; data: Interview[] }> {
    return interviewService.getJobInterviews(jobId).then((interviews) => ({
      success: true,
      data: interviews,
    }));
  }

  updateInterview(
    id: string,
    data: Partial<CreateInterviewRequest>,
  ): Promise<{ success: boolean; data: Interview }> {
    return interviewService.updateInterview(id, data).then((interview) => ({
      success: true,
      data: interview,
    }));
  }

  deleteInterview(id: string): Promise<{ success: boolean; message: string }> {
    return interviewService.deleteInterview(id).then((message) => ({
      success: true,
      message,
    }));
  }

  setToken(token: string): void {
    tokenStorage.setToken(token);
  }

  getToken(): string | null {
    return tokenStorage.getToken();
  }

  removeToken(): void {
    tokenStorage.removeToken();
  }

  isAuthenticated(): boolean {
    return tokenStorage.isAuthenticated();
  }
}

export const apiService = new ApiService();

export type { Interview } from "@/types/interview";
