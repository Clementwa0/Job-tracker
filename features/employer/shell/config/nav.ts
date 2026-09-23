import type { LucideIcon } from "lucide-react";
import { Building2, ClipboardList, LayoutDashboard, Settings } from "lucide-react";

export interface EmployerNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const EMPLOYER_MAIN_NAV: EmployerNavItem[] = [
  { path: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/employer/dashboard/jobs", label: "Job Postings", icon: ClipboardList },
  { path: "/employer/dashboard/company", label: "Company Profile", icon: Building2 },
  { path: "/employer/dashboard/settings", label: "Settings", icon: Settings },
];
