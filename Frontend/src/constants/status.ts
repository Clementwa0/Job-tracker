export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "waiting_response"
  | "ghosted";

export const STATUS_OPTIONS: {
  label: string;
  value: ApplicationStatus;
}[] = [
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Waiting Response", value: "waiting_response" },
  { label: "Ghosted", value: "ghosted" },
];