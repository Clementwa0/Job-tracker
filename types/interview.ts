export type InterviewStage = "phone" | "hr" | "technical" | "behavioral" | "onsite" | "final";
export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "canceled"
  | "passed"
  | "failed"
  | "rescheduled";

  
export interface JobReference {
  _id: string;
  jobTitle: string;
  companyName: string;
  applicationStatus: string;
}

export interface Interview {
  data: Interview;
  _id: string;
  userId?: string;
  jobId: string | JobReference | null;
  stage: InterviewStage;
  status: InterviewStatus;
  interviewDate: string;
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewRequest {
  jobId: string;
  stage: InterviewStage;
  status: InterviewStatus;
  interviewDate: string;
  location: string;
  notes?: string;
}

export function isPopulatedJobId(
  jobId: string | JobReference | null | undefined,
): jobId is JobReference {
  return typeof jobId === "object" && jobId !== null && "_id" in jobId;
}