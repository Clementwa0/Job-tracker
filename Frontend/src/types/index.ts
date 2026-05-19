export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from "./api";
export { isApiError } from "./api";

export type {
  User,
  AuthData,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from "./auth";

export type {
  Job,
  JobPayload,
  BackendJob,
  ApplicationStatus,
} from "./job";

export type {
  Interview,
  InterviewStage,
  InterviewStatus,
  JobReference,
  CreateInterviewRequest,
} from "./interview";
export { isPopulatedJobId } from "./interview";

export type { CVFeedback, UploadedFile } from "./resume.types";
