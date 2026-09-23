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


export const TEMPLATE_STYLES = {
  modern: {
    padding: "0.75in 0.75in",

    fontFamily:
      "'Inter', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",

    fontSize: "12px",
    lineHeight: 1.65,

    nameSize: "32px",
    nameWeight: 800,
    nameSpacing: "-0.03em",
    nameTransform: "uppercase",

    roleSize: "13px",
    roleWeight: 500,

    headerAlign: "left",
    headerBorder: "accent",

    sectionGap: "22px",

    headingStyle: "accent",
    headingSize: "11px",
    headingWeight: 700,
    headingTracking: "0.18em",

    itemGap: "14px",

    bulletStyle: "disc",
    bulletIndent: "18px",

    dividerOpacity: 0.12,

    contactGap: "14px",

    cardStyle: "soft",
  },

  classic: {
    padding: "0.75in 0.75in",

    fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif",

    fontSize: "12px",
    lineHeight: 1.5,

    nameSize: "34px",
    nameWeight: 600,
    nameSpacing: "-0.01em",
    nameTransform: "none",

    roleSize: "13px",
    roleWeight: 500,

    headerAlign: "center",
    headerBorder: "thin",

    sectionGap: "15px",

    headingStyle: "rule",
    headingSize: "12px",
    headingWeight: 900,
    headingTracking: "0.28em",

    itemGap: "12px",

    bulletStyle: "disc",
    bulletIndent: "18px",

    dividerOpacity: 0.18,

    contactGap: "12px",

    cardStyle: "clean",
  },

  compact: {
    padding: "0.45in 0.55in",

    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",

    fontSize: "9.8px",
    lineHeight: 1.45,

    nameSize: "23px",
    nameWeight: 800,
    nameSpacing: "-0.04em",
    nameTransform: "none",
    roleSize: "11px",
    roleWeight: 600,

    headerAlign: "left",
    headerBorder: "thin",

    sectionGap: "12px",

    headingStyle: "muted",
    headingSize: "10px",
    headingWeight: 700,
    headingTracking: "0.14em",

    itemGap: "10px",

    bulletStyle: "dash",
    bulletIndent: "14px",

    dividerOpacity: 0.1,

    contactGap: "10px",

    cardStyle: "minimal",
  },

  executive: {
    padding: "0.75in 0.2in",

    fontFamily: "'Cormorant Garamond', 'Libre Baskerville', Georgia, serif",

    fontSize: "11.8px",
    lineHeight: 1.5,

    nameSize: "38px",
    nameWeight: 500,
    nameTransform: "uppercase",
    nameSpacing: "0",

    roleSize: "15px",
    roleWeight: 500,

    headerAlign: "center",
    headerBorder: "double",

    sectionGap: "24px",

    headingStyle: "executive",
    headingSize: "11px",
    headingWeight: 700,
    headingTracking: "0.38em",

    itemGap: "16px",

    bulletStyle: "square",
    bulletIndent: "20px",

    dividerOpacity: 0.22,

    contactGap: "16px",

    cardStyle: "luxury",
  },

  minimal: {
    padding: "0.75in 0.8in",

    fontFamily: "'Inter', 'Manrope', ui-sans-serif, system-ui, sans-serif",

    fontSize: "10.8px",
    lineHeight: 1.6,

    nameSize: "24px",
    nameWeight: 600,
    nameSpacing: "-0.02em",
    nameTransform: "none",

    roleSize: "12px",
    roleWeight: 500,

    headerAlign: "left",
    headerBorder: "none",

    sectionGap: "18px",

    headingStyle: "muted",
    headingSize: "10px",
    headingWeight: 700,
    headingTracking: "0.24em",

    itemGap: "12px",

    bulletStyle: "dash",
    bulletIndent: "16px",

    dividerOpacity: 0.08,

    contactGap: "12px",

    cardStyle: "flat",
  },
} as const;
