import type { ApplicationStatus } from "@/types/job";
import type { LucideIcon } from "lucide-react";

import {
  FileCheck,
  Calendar,
  LineChart,
  LayoutDashboard,
  Plus,
  BriefcaseBusiness,
  FileText,
  FilePlus2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Feature = {
  id: number;
  icon: LucideIcon;
  title: string;
  description?: string;
  desc?: string;
  color?: string;
};

type NavLink = {
  path: string;
  name: string;
  icon: LucideIcon;
};

type NavItem = {
  id: string;
  label: string;
};

type SelectOption<T = string> = {
  label: string;
  value: T;
};

type InterviewStatus = {
  value: string;
  label: string;
  className: string;
};

/* -------------------------------------------------------------------------- */
/*                                  FEATURES                                  */
/* -------------------------------------------------------------------------- */

export const features: Feature[] = [
  {
    id: 1,
    icon: FileCheck,
    title: "Application Tracking",
    description: "Keep track of all your job applications in one place.",
    color: "text-blue-500",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Interview Scheduling",
    description: "Manage your interview schedule and never miss meetings.",
    color: "text-green-500",
  },
  {
    id: 3,
    icon: LineChart,
    title: "Performance Analytics",
    description: "Get insights into your job search performance.",
    color: "text-purple-500",
  },
];

export const loginFeatures: Feature[] = [
  {
    id: 1,
    icon: FileCheck,
    title: "Application Management",
    desc: "Track all your applications and statuses",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Job Alerts",
    desc: "Receive smart notifications",
  },
  {
    id: 3,
    icon: LineChart,
    title: "Progress Reports",
    desc: "Visualize your job search journey",
  },
];

export const registerFeatures: Feature[] = [
  {
    id: 1,
    icon: FileCheck,
    title: "Track Progress",
    desc: "Visualize your job hunt journey",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Smart Alerts",
    desc: "Never miss deadlines or interviews",
  },
  {
    id: 3,
    icon: FileText,
    title: "Centralized",
    desc: "All your job data in one hub",
  },
  {
    id: 4,
    icon: LineChart,
    title: "Performance Insights",
    desc: "Understand your job search performance",
  },
];

/* -------------------------------------------------------------------------- */
/*                                NAVIGATION                                  */
/* -------------------------------------------------------------------------- */

export const links: NavLink[] = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/jobs",
    name: "Jobs",
    icon: BriefcaseBusiness,
  },
  {
    path: "/add-job",
    name: "Add Job",
    icon: Plus,
  },
  {
    path: "/analytics",
    name: "Analytics",
    icon: LineChart,
  },
  {
    path: "/calendar",
    name: "Calendar",
    icon: Calendar,
  },
  {
    path: "/cv-review",
    name: "AI CV Review",
    icon: FileText,
  },
  {
    path: "/resumes",
    name: "Resume Builder",
    icon: FilePlus2,
  },
];

export const navItems: NavItem[] = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it Works" },
  { id: "pricing", label: "Contact" },
];

/* -------------------------------------------------------------------------- */
/*                                 JOB DATA                                   */
/* -------------------------------------------------------------------------- */

export const jobTypes = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
] as const;

export const sources = [
  "LinkedIn",
  "Indeed",
  "Company Website",
  "Referral",
  "Glassdoor",
  "AngelList",
  "Other",
] as const;

/* -------------------------------------------------------------------------- */
/*                              APPLICATION STATUS                            */
/* -------------------------------------------------------------------------- */

export const applicationStatuses: SelectOption<ApplicationStatus>[] = [
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Waiting Response", value: "waiting_response" },
  { label: "Ghosted", value: "ghosted" },
  { label: "Completed", value: "completed" },
];

export const statuses = applicationStatuses;

export const statusOptions: SelectOption[] = [
  { label: "All Statuses", value: "" },
  ...applicationStatuses,
];

/* -------------------------------------------------------------------------- */
/*                           RECENT APPLICATIONS                              */
/* -------------------------------------------------------------------------- */

export const recentApplications = [
  {
    id: 1,
    company: "Google",
    position: "Frontend Developer",
    status: "interviewing",
    date: "2 days ago",
  },
  {
    id: 2,
    company: "Microsoft",
    position: "Product Manager",
    status: "applied",
    date: "4 days ago",
  },
  {
    id: 3,
    company: "UshauriTech",
    position: "UX Designer",
    status: "offer",
    date: "1 week ago",
  },
];

/* -------------------------------------------------------------------------- */
/*                                JOB LABELS                                  */
/* -------------------------------------------------------------------------- */

export const jobLabels = [
  { label: "Title", field: "jobTitle" },
  { label: "Company", field: "companyName" },
  { label: "Location", field: "location" },
  { label: "Type", field: "jobType" },
  { label: "Applied On", field: "applicationDate" },
  { label: "Deadline", field: "deadline" },
  { label: "Salary", field: "salary" },
  { label: "Status", field: "applicationStatus" },
] as const;

/* -------------------------------------------------------------------------- */
/*                             INTERVIEW STAGES                               */
/* -------------------------------------------------------------------------- */

export const interviewStages = [
  { value: "applied", label: "Application Submitted" },
  { value: "screening", label: "HR Screening" },
  { value: "phone_interview", label: "Phone Interview" },
  { value: "technical", label: "Technical Interview" },
  { value: "onsite", label: "Onsite / In-person Interview" },
  { value: "final", label: "Final Interview" },
  { value: "offer", label: "Offer Stage" },
  { value: "hired", label: "Hired" },
] as const;

/* -------------------------------------------------------------------------- */
/*                            INTERVIEW STATUS                                */
/* -------------------------------------------------------------------------- */

export const interviewStatus: InterviewStatus[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    className: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    value: "completed",
    label: "Completed",
    className: "text-green-400 bg-green-500/10 border-green-500/30",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    className: "text-red-400 bg-red-500/10 border-red-500/30",
  },
];

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string }
> = {
  applied: {
    label: "Applied",
    color: "#3b82f6",
  },

  interviewing: {
    label: "Interviewing",
    color: "#8b5cf6",
  },

  offer: {
    label: "Offer",
    color: "#22c55e",
  },

  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },

  ghosted: {
    label: "Ghosted",
    color: "#64748b",
  },

  completed: {
    label: "Completed",
    color: "#06b6d4",
  },

  waiting_response: {
    label: "Waiting Response",
    color: "#f59e0b",
  },
};

export const FUNNEL_ORDER: ApplicationStatus[] = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "waiting_response",
  "ghosted",
  "completed",
];

export const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-foreground)",
  fontSize: 12,
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const daysAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
  return Math.max(0, Math.round(diff));
};

export const TEMPLATE_STYLES = {
  modern: {
    padding: "0.8in 0.85in",

    fontFamily:
      "'Inter', 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",

    fontSize: "11px",
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
    padding: "0.9in 0.95in",

    fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif",

    fontSize: "11.5px",
    lineHeight: 1.75,

    nameSize: "34px",
    nameWeight: 600,
    nameSpacing: "-0.01em",
    nameTransform: "none",

    roleSize: "13px",
    roleWeight: 500,

    headerAlign: "center",
    headerBorder: "thin",

    sectionGap: "20px",

    headingStyle: "rule",
    headingSize: "11px",
    headingWeight: 700,
    headingTracking: "0.28em",

    itemGap: "15px",

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
