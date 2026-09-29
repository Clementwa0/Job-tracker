import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  FileSearch,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Search,
  Settings,
  User,
} from "lucide-react";
import { BarChartIcon, CalendarIcon, ClipboardListIcon } from "../MobileIcons";
import type { DashboardConfig } from "../types";

export const jobseekerConfig: DashboardConfig = {
  role: "user",
  loginPath: "/account",
  brand: { name: "JobTrail", tagline: "Job application tracker", logoSrc: "/logo.png" },

  sections: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", href: "/jobseeker", icon: LayoutDashboard, exact: true },
        { title: "Applications", href: "/jobseeker/applications", icon: BriefcaseBusiness },
        { title: "Interviews", href: "/jobseeker/interviews", icon: CalendarDays },
        { title: "Calendar", href: "/jobseeker/calendar", icon: CalendarDays },
        { title: "Resumes", href: "/jobseeker/resumes", icon: FileText },
        { title: "CV Review", href: "/jobseeker/cv-review", icon: FileSearch },
        { title: "Analytics", href: "/jobseeker/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Discover",
      items: [{ title: "Browse Jobs", href: "/job-board", icon: Search }],
    },
    {
      label: "Account",
      items: [
        { title: "Settings", href: "/jobseeker/settings", icon: Settings },
        { title: "Help & Support", href: "/jobseeker/help", icon: HelpCircle },
      ],
    },
  ],

  mobile: {
    home: { title: "Home", href: "/jobseeker" },
    left: [
      { title: "Applications", href: "/jobseeker/applications", icon: ClipboardListIcon },
      { title: "Analytics", href: "/jobseeker/analytics", icon: BarChartIcon },
    ],
    right: [{ title: "Interview", href: "/jobseeker/interviews", icon: CalendarIcon }],
  },

  header: {
    roleLabel: "Job Seeker",
    fallbackName: "JobTrail User",
    searchPlaceholder: "Search jobs, companies, or keywords…",
    notifications: true,
    profileLinks: [
      { label: "Profile", href: "/jobseeker/settings", icon: User },
      { label: "Settings", href: "/jobseeker/settings", icon: Settings },
      { label: "Help & Support", href: "/jobseeker/help", icon: HelpCircle },
    ],
  },
};
