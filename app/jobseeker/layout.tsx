"use client";

import type { ReactNode } from "react";
import DashboardShell from "@/components/shared/dashboard/DashboardShell";
import { jobseekerConfig } from "@/components/shared/dashboard/config";

export default function JobseekerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DashboardShell config={jobseekerConfig}>{children}</DashboardShell>;
}
