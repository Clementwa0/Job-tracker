import {
  FileCheck,
  Calendar,
  LineChart,
  LayoutDashboard,
  Plus,
  UserPen,
  BriefcaseBusiness,
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
    // true means content on left, number on right; false means opposite
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
    icon: "📈",
    title: "Track Progress",
    desc: "Visualize your job hunt journey",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    desc: "Never miss deadlines or interviews",
  },
  {
    icon: "📋",
    title: "Centralized",
    desc: "All your job data in one hub",
  },
];
export const user = {
  name: "John Doe",
  email: "john.doe@example.com",
};

export const links = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/jobs", name: "Jobs", icon: BriefcaseBusiness },
  { path: "/add-job", name: "Add Job", icon: Plus },
  { path: "/analytics", name: "Analytics", icon: LineChart },
  { path: "/calendar", name: "Calendar", icon: Calendar },
  { path: "/profile", name: "Profile", icon: UserPen },

];

export const recentApplications = [
  {
    company: "Acme Corp",
    position: "Frontend Developer",
    status: "interview",
    date: "2 days ago",
  },
  {
    company: "Globex Inc",
    position: "Product Manager",
    status: "applied",
    date: "4 days ago",
  },
  {
    company: "Stark Industries",
    position: "UX Designer",
    status: "offer",
    date: "1 week ago",
  },
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