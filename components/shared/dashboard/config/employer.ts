import type { LucideIcon } from "lucide-react";
import { Building2, ClipboardList, ExternalLink, LayoutDashboard, Settings } from "lucide-react";
import { lucideTab } from "../MobileIcons";
import type { DashboardConfig, DashboardNavItem } from "../types";

/* ---------- Route table (single source of truth) ---------- */
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

const toItem = ({ path, label, icon, exact }: (typeof EMPLOYER_MAIN_NAV)[number]): DashboardNavItem => ({
  title: label,
  href: path,
  icon,
  exact,
});

const settingsPath = "/employer/dashboard/settings";
const workspace = EMPLOYER_MAIN_NAV.filter((i) => i.path !== settingsPath).map(toItem);
const account = EMPLOYER_MAIN_NAV.filter((i) => i.path === settingsPath).map(toItem);
const byPath = (path: string) => EMPLOYER_MAIN_NAV.find((i) => i.path === path)!;

const jobs = byPath("/employer/dashboard/jobs");
const company = byPath("/employer/dashboard/company");

export const employerConfig: DashboardConfig = {
  role: "employer",
  loginPath: "/employer/login",
  brand: { name: "JobTrail", tagline: "Employer workspace", logoSrc: "/logo.png" },

  sections: [
    { label: "Workspace", items: workspace },
    { label: "Discover", items: [{ title: "Public site", href: "/", icon: ExternalLink }] },
    { label: "Account", items: account },
  ],

  mobile: {
    home: { title: "Home", href: "/employer/dashboard" },
    left: [
      { title: "Postings", href: jobs.path, icon: lucideTab(jobs.icon) },
      { title: "Company", href: company.path, icon: lucideTab(company.icon) },
    ],
    right: [{ title: "Settings", href: settingsPath, icon: lucideTab(Settings) }],
  },

  header: {
    roleLabel: "Employer",
    fallbackName: "Employer",
    notifications: true,
    profileLinks: [
      { label: "Company profile", href: company.path, icon: Building2 },
      { label: "Settings", href: settingsPath, icon: Settings },
    ],
  },
};
