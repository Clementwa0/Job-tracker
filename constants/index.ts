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


import type { ResumeTemplate } from "@/types/resume-builder";

export const RESUME_TEMPLATES = [
  { id: "aurora", name: "Aurora", description: "Modern professional", category: "Professional", recommended: true },
  { id: "atlas", name: "Atlas", description: "Technical two-column", category: "Technology" },
  { id: "vertex", name: "Vertex", description: "Developer focused", category: "Technology" },
  { id: "horizon", name: "Horizon", description: "Executive & corporate", category: "Corporate" },
  { id: "mono", name: "Mono", description: "Minimal & ATS-friendly", category: "Minimal" },
  { id: "impact", name: "Impact", description: "Achievement focused", category: "Professional" },
] as const satisfies readonly { id: ResumeTemplate; name: string; description: string; category: string; recommended?: boolean }[];

export const TEMPLATE_STYLES = {
  aurora: { headingSize: "11px", headingWeight: 700, headingTracking: "0.12em", sectionGap: "18px", itemGap: "10px", bulletIndent: "18px", bulletStyle: "disc" as const },
  atlas: { headingSize: "10px", headingWeight: 800, headingTracking: "0.14em", sectionGap: "15px", itemGap: "9px", bulletIndent: "16px", bulletStyle: "disc" as const },
  vertex: { headingSize: "10px", headingWeight: 800, headingTracking: "0.08em", sectionGap: "15px", itemGap: "9px", bulletIndent: "16px", bulletStyle: "disc" as const },
  horizon: { headingSize: "10px", headingWeight: 700, headingTracking: "0.18em", sectionGap: "20px", itemGap: "11px", bulletIndent: "17px", bulletStyle: "disc" as const },
  mono: { headingSize: "10px", headingWeight: 700, headingTracking: "0.06em", sectionGap: "13px", itemGap: "8px", bulletIndent: "16px", bulletStyle: "disc" as const },
  impact: { headingSize: "10px", headingWeight: 800, headingTracking: "0.1em", sectionGap: "16px", itemGap: "10px", bulletIndent: "16px", bulletStyle: "disc" as const },
} as const;
