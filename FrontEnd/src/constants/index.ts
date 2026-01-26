import {
  FileCheck,
  Calendar,
  LineChart,
  LayoutDashboard,
  Plus,
  BriefcaseBusiness,
  FileText,
  TrendingUp, Bell 
} from "lucide-react";
  import { } from "lucide-react";


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
  }
];

export const login = [
  {
    icon: "📋",
    title: "Application Management",
    desc: "Keep track of your job applications and statuses",
  },
  {
    icon: "🔔",
    title: "Job Alerts",
    desc: "Get notified about new opportunities matching your profile",
  },
  {
    icon: "📊",
    title: "Progress Reports",
    desc: "Visualize your job search journey and milestones",
  },
];

export const register = [
  {
    icon: BriefcaseBusiness,
    title: "Track Applications",
    desc: "Organize all your job applications in one place",
  },
  {
    icon: Calendar,
    title: "Interview Scheduler",
    desc: "Never miss an interview with smart reminders",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    desc: "Visualize your job search performance",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    desc: "Get notified about application updates",
  },
];



export const links = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/jobs", name: "Jobs", icon: BriefcaseBusiness },
  { path: "/add-job", name: "Add Job", icon: Plus },
  { path: "/analytics", name: "Analytics", icon: LineChart },
  { path: "/calendar", name: "Calendar", icon: Calendar },
  {path: "/cvCreator", name: "AI CV Review", icon: FileText}

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
export const statuses = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Waiting Response",
  "Ghosted",
];

export const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Applied", value: "applied" },
  { label: "Interviewed", value: "interviewed" },
  { label: "Offered", value: "offered" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
];

export const recentApplications = [
  {
    company: "Google",
    position: "Frontend Developer",
    status: "interview",
    date: "2 days ago",
  },
  {
    company: "Microsoft",
    position: "Product Manager",
    status: "applied",
    date: "4 days ago",
  },
  {
    company: "UshauriTech",
    position: "UX Designer",
    status: "offer",
    date: "1 week ago",
  },
];

export const joblabel = [
  { label: "Title", field: "title" },
  { label: "Company", field: "company" },
  { label: "Location" },
  { label: "Type" },
  { label: "Applied On", field: "applicationDate" },
  { label: "Deadline" },
  { label: "Salary" },
  { label: "Status", field: "status" },
];


export const tips = [
  {
    title: "Customize Every Application",
    description: "Tailor your resume and cover letter for each job. Use keywords from the job description to pass applicant tracking systems (ATS).",
  },
  {
    title: "Quantify Your Achievements",
    description: "Use measurable impact: 'Increased website traffic by 40% in 3 months.' It shows real value.",
  },
  {
    title: "Follow Up Professionally",
    description: "If you don’t hear back in 7–10 days, send a polite follow-up email to show continued interest.",
  },
  {
    title: "Use a Clean, Readable Format",
    description: "Keep your resume simple with clear headings and bullet points. Avoid overly fancy designs.",
  },
  {
    title: "Build and Share a Portfolio",
    description: "Showcase your projects in a portfolio. It increases trust and helps you stand out.",
  },
];

export const motivationalQuotes = [
  "Every application brings you closer to your dream job! 🚀",
  "Your next opportunity is just around the corner! 💪",
  "Persistence is the key to success! Keep going! ✨",
  "Every 'no' brings you closer to your 'yes'! 🎯",
  "Your skills are in demand. Keep pushing forward! 🔥",
];

