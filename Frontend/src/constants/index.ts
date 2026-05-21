import type { ApplicationStatus } from "@/types/job";
import {
  FileCheck,
  Calendar,
  LineChart,
  LayoutDashboard,
  Plus,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

export const features = [
  {
    id: 1,
    icon: FileCheck,
    title: "Application Tracking",
    description:
      "Keep track of all your job applications in one place. Never lose track of where you applied.",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Interview Scheduling",
    description:
      "Manage your interview schedule and never miss an important meeting or follow-up.",
  },
  {
    id: 3,
    icon: LineChart,
    title: "Performance Analytics",
    description:
      "Get insights into your job search with detailed analytics and visualization tools.",
  },
];

export const steps = [
  {
    id: 1,
    title: "Create an account",
    description:
      "Sign up for a free account to get started. No credit card required.",
    isContentLeft: true,
  },
  {
    id: 2,
    title: "Add your applications",
    description:
      "Log your job applications, including company, position, status, and notes.",
    isContentLeft: false,
  },
  {
    id: 3,
    title: "Track progress",
    description:
      "Update the status of your applications as you move through the interview process.",
    isContentLeft: true,
  },
  {
    id: 4,
    title: "Get insights",
    description:
      "View analytics and reports to optimize your job search strategy.",
    isContentLeft: false,
  },
];

export const loginFeatures = [
  {
    icon: FileCheck,
    title: "Application Management",
    desc: "Keep track of your job applications and statuses",
  },
  {
    icon: Calendar,
    title: "Job Alerts",
    desc: "Get notified about new opportunities matching your profile",
  },
  {
    icon: LineChart,
    title: "Progress Reports",
    desc: "Visualize your job search journey and milestones",
  },
];

export const register = [
  {
    icon: FileCheck,
    title: "Track Progress",
    desc: "Visualize your job hunt journey",
  },
  {
    icon: Calendar,
    title: "Smart Alerts",
    desc: "Never miss deadlines or interviews",
  },
  {
    icon: FileText,
    title: "Centralized",
    desc: "All your job data in one hub",
  },
  {
    icon: LineChart,
    title: "Performance Insights",
    desc: "Understand your job search performance",
  },
];

export const links = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/jobs", name: "Jobs", icon: BriefcaseBusiness },
  { path: "/add-job", name: "Add Job", icon: Plus },
  { path: "/analytics", name: "Analytics", icon: LineChart },
  { path: "/calendar", name: "Calendar", icon: Calendar },
  { path: "/cv-review", name: "AI CV Review", icon: FileText },
];
export const navItems = [
    { id: "features", label: "Features" },
    { id: "how", label: "How it works" },
    { id: "pricing", label: "Contact" },
  ];

export const jobTypes = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
];
export const sources = [
  "LinkedIn",
  "Indeed",
  "Company Website",
  "Referral",
  "Glassdoor",
  "AngelList",
  "Other",
];

export const statuses: { value: ApplicationStatus; label: string }[] = [
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Waiting Response", value: "waiting response" },
  { label: "Ghosted", value: "ghosted" },
  { label: "Completed", value: "completed" },
];

export const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Applied", value: "applied" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Waiting Response", value: "waiting response" },
  { label: "Ghosted", value: "ghosted" },
  { label: "Completed", value: "completed" },
];

export const recentApplications = [
  {
    id: 1,
    company: "Google",
    position: "Frontend Developer",
    status: "interview",
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

export const joblabel = [
  { label: "Title", field: "jobTitle" },
  { label: "Company", field: "companyName" },
  { label: "Location" },
  { label: "Type" },
  { label: "Applied On", field: "applicationDate" },
  { label: "Deadline" },
  { label: "Salary" },
  { label: "Status", field: "applicationStatus" },
];

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

export const interviewStatus = [
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
] as const;