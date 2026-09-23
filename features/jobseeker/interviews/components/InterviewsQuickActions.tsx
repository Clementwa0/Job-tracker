"use client";

import Link from "next/link";
import { Zap, CalendarPlus, CalendarClock, ClipboardList, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const SECONDARY_ACTIONS = [
  { href: "/jobseeker/settings", label: "Update Availability", icon: CalendarClock },
  { href: "/jobseeker/cv-review", label: "Interview Preparation", icon: ClipboardList },
  { href: "/jobseeker/calendar", label: "View Calendar", icon: CalendarClock },
];

type Props = {
  onAddInterview: () => void;
};

const InterviewsQuickActions = ({ onAddInterview }: Props) => {
  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-display text-base font-semibold tracking-tight">Quick Actions</h2>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onAddInterview}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <span className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Add Interview
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>

        {SECONDARY_ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default InterviewsQuickActions;
