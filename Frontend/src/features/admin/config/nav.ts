import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  FileStack,
  LayoutDashboard,
  LineChart,
  Settings,
} from "lucide-react";

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
