"use client";

import Link from "next/link";
import { Zap, Search, ListChecks, FileUp, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";

const ACTIONS = [
  { href: "/job-board", label: "Browse Jobs", icon: Search, primary: true },
  { href: "/jobseeker/applications", label: "View Applications", icon: ListChecks },
  { href: "/jobseeker/resumes", label: "Upload Resume", icon: FileUp },
  { href: "/jobseeker/settings", label: "Update Profile", icon: UserRound },
];

const QuickActionsCard = () => (
  <Card className="border-border p-4 shadow-none">
    <div className="mb-3 flex items-center gap-1.5">
      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
      <h2 className="font-display text-sm font-semibold tracking-tight">
        Quick Actions
      </h2>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ACTIONS.map(({ href, label, icon: Icon, primary }) => (
        <Link
          key={href}
          href={href}
          className={
            primary
              ? "flex flex-col items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-3 text-center text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              : "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-3 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </div>
  </Card>
);

export default QuickActionsCard;
