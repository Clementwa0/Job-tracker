import type { ApplicationStatus } from "@/types/job";
import type { InterviewStage, InterviewStatus } from "@/types/interview";

/** Free-text-ish job type options offered on the job form. */
export const jobTypes: string[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Temporary",
];

/** Where a job application came from. */
export const sources: string[] = [
  "LinkedIn",
  "Indeed",
  "Company website",
  "Referral",
  "Glassdoor",
  "AngelList",
  "Other",
];

/** Application status options for the job form's status select. */
export const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "waiting_response", label: "Waiting on response" },
  { value: "ghosted", label: "Ghosted" },
  { value: "completed", label: "Completed" },
];

/** Same as `statuses`, plus an "All statuses" option for filter bars. */
export const statusOptions: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  ...statuses,
];

/** Interview stage options for the interview form. */
export const interviewStages: { value: InterviewStage; label: string }[] = [
  { value: "phone", label: "Phone screen" },
  { value: "hr", label: "HR" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "onsite", label: "Onsite" },
  { value: "final", label: "Final" },
];

/** Interview status options, each with a badge className for status pills. */
export const interviewStatus: { value: InterviewStatus; label: string; className: string }[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    className: "bg-primary/10 text-primary border-primary/25",
  },
  {
    value: "completed",
    label: "Completed",
    className: "bg-muted text-muted-foreground border-border",
  },
  {
    value: "canceled",
    label: "Canceled",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
  {
    value: "passed",
    label: "Passed",
    className: "bg-green-500/10 text-green-600 border-green-500/25 dark:text-green-400",
  },
  {
    value: "failed",
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/25",
  },
  {
    value: "rescheduled",
    label: "Rescheduled",
    className: "bg-gold/15 text-gold-foreground border-gold/30 dark:text-gold",
  },
];


