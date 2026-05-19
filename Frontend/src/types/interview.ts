export type InterviewStage = "phone" | "hr" | "technical" | "onsite" | "final";
export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

  
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
  jobId: string | JobReference;
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
  jobId: string | JobReference,
): jobId is JobReference {
  return typeof jobId === "object" && jobId !== null && "_id" in jobId;
}