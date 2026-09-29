"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/shared/dashboard/DashboardShell";
import { employerConfig } from "@/components/shared/dashboard/config";

export default function EmployerDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell config={employerConfig}>{children}</DashboardShell>;
}
