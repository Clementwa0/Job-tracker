"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/shared/dashboard/DashboardShell";
import { adminConfig } from "@/components/shared/dashboard/config";

export default function AdminProtectedLayout({ children }: { children: ReactNode }) {
  return <DashboardShell config={adminConfig}>{children}</DashboardShell>;
}
