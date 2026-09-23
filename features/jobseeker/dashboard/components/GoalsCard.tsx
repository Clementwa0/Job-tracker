"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardSummary } from "@/features/jobseeker/dashboard/hooks/useDashboardSummary";
import { cn } from "@/lib/utils";

const GoalsCard = () => {
  const { stats } = useDashboardSummary();

  const goals = useMemo(() => {
    return [
      { label: "Apply to 5 jobs this week", done: stats.appliedLast7Days >= 5 },
      { label: "Update CV and portfolio", done: false },
      {
        label: stats.interviews > 0 ? "Prepare for your interview" : "Book a mock interview",
        done: false,
      },
      { label: "Follow up on pending applications", done: stats.applied > stats.interviews },
      { label: "Complete a skills certification", done: false },
      { label: "Apply for 5 more jobs", done: false },
    ].slice(0, 5);
  }, [stats]);

  const completed = goals.filter((g) => g.done).length;
  const pct = Math.round((completed / goals.length) * 100);
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">Your Goals</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Next 30 days</p>
        </div>
        <Link
          href="/jobseeker/analytics"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--muted)" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">
              {completed}/{goals.length}
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {completed} of {goals.length} goals completed. Keep up the momentum!
        </p>
      </div>

      <ul className="space-y-2">
        {goals.map((g) => (
          <li key={g.label} className="flex items-center gap-2 text-sm">
            {g.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
            <span className={cn("truncate", g.done && "text-muted-foreground line-through")}>
              {g.label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default GoalsCard;
