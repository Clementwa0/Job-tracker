import type { LucideIcon } from "lucide-react";
import { Building2, ClipboardList, ExternalLink, FileStack, LayoutDashboard, LineChart, Settings } from "lucide-react";
import { lucideTab } from "../MobileIcons";
import type { DashboardConfig, DashboardNavItem } from "../types";

/* ---------- Route table (single source of truth) ---------- */
export interface AdminNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const ADMIN_MAIN_NAV: AdminNavItem[] = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/jobs", label: "Jobs", icon: ClipboardList },
  { path: "/admin/companies", label: "Companies", icon: Building2 },
  { path: "/admin/applications", label: "Applications", icon: FileStack },
  { path: "/admin/analytics", label: "Analytics", icon: LineChart },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const toItem = ({ path, label, icon, exact }: (typeof ADMIN_MAIN_NAV)[number]): DashboardNavItem => ({
  title: label,
  href: path,
  icon,
  exact,
});

const settingsPath = "/admin/settings";
const workspace = ADMIN_MAIN_NAV.filter((i) => i.path !== settingsPath).map(toItem);
const account = ADMIN_MAIN_NAV.filter((i) => i.path === settingsPath).map(toItem);
const byPath = (path: string) => ADMIN_MAIN_NAV.find((i) => i.path === path)!;

const jobs = byPath("/admin/jobs");
const companies = byPath("/admin/companies");
const applications = byPath("/admin/applications");

export const adminConfig: DashboardConfig = {
  role: "admin",
  loginPath: "/admin/login",
  brand: { name: "JobTrail", tagline: "Admin console", logoSrc: "/logo.png" },

  sections: [
    { label: "Workspace", items: workspace },
    { label: "Discover", items: [{ title: "Public site", href: "/", icon: ExternalLink }] },
    { label: "Account", items: account },
  ],

  mobile: {
    home: { title: "Home", href: "/admin/dashboard" },
    left: [
      { title: "Jobs", href: jobs.path, icon: lucideTab(jobs.icon) },
      { title: "Companies", href: companies.path, icon: lucideTab(companies.icon) },
    ],
    right: [{ title: "Applications", href: applications.path, icon: lucideTab(applications.icon) }],
  },

  header: {
    roleLabel: "Administrator",
    fallbackName: "Administrator",
    notifications: false,
    profileLinks: [{ label: "Settings", href: settingsPath, icon: Settings }],
  },
};
