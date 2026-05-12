import {
  LayoutDashboard,
  BriefcaseBusiness,
  Plus,
  LineChart,
  Calendar,
  FileText,
} from "lucide-react";

export const links = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/jobs", name: "Jobs", icon: BriefcaseBusiness },
  { path: "/add-job", name: "Add Job", icon: Plus },
  { path: "/analytics", name: "Analytics", icon: LineChart },
  { path: "/calendar", name: "Calendar", icon: Calendar },
  { path: "/cvCreator", name: "AI CV Review", icon: FileText },
];