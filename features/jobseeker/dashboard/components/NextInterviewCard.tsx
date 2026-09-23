"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { isPopulatedJobId } from "@/types/interview";

const NextInterviewCard = () => {
  const { interviews, loading } = useInterviews();

  const next = useMemo(() => {
    const now = Date.now();
    return interviews
      .filter((i) => i.status === "scheduled" && new Date(i.interviewDate).getTime() >= now)
      .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime())[0];
  }, [interviews]);

  const job = next && isPopulatedJobId(next.jobId) ? next.jobId : null;

  // Simple readiness heuristic: closer interviews imply more preparation already logged.
  const prep = useMemo(() => {
    if (!next) return 0;
    const daysAway = Math.max(
      0,
      Math.round((new Date(next.interviewDate).getTime() - Date.now()) / 86_400_000)
    );
    return Math.max(20, Math.min(90, 100 - daysAway * 10));
  }, [next]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight">Upcoming Interview</h2>
        <Link
          href="/jobseeker/interviews"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted/40" />
      ) : !next ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-xs font-medium text-foreground">No interviews scheduled</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Line one up and it&apos;ll show here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {(job?.companyName ?? "JT").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {job?.jobTitle ?? "Interview"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {job?.companyName ?? "Company TBD"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              {new Date(next.interviewDate).toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            {next.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{next.location}</span>
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Preparation</span>
              <span className="font-medium text-foreground">{prep}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${prep}%` }}
              />
            </div>
          </div>

          <Link
            href="/jobseeker/interviews"
            className="mt-3 flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Prepare for Interview
          </Link>
        </>
      )}
    </Card>
  );
};

export default NextInterviewCard;
