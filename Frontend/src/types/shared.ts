export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "accepted"
  | "waiting_response"
  | "ghosted";

export interface Interview {
  date: string;
  type: string;
  notes: string;
}