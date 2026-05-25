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
    description:
      "Keep track of all your job applications in one place.",
    color: "text-blue-500",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Interview Scheduling",
    description:
      "Manage your interview schedule and never miss meetings.",
    color: "text-green-500",
  },
  {
    id: 3,
    icon: LineChart,
    title: "Performance Analytics",
    description:
      "Get insights into your job search performance.",
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
    path: "/resume-builder",
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