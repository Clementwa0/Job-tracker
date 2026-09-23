"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { isPopulatedJobId } from "@/types/interview";

const stageLabel: Record<string, string> = {
  phone: "Phone Screen",
  hr: "HR Interview",
  technical: "Technical",
  behavioral: "Behavioral",
  onsite: "Onsite",
  final: "Final Round",
};

const formatDateTime = (date: string) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Date TBD";
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const UpcomingInterviews = () => {
  const { interviews, loading } = useInterviews();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return interviews
      .filter(
        (i) =>
          i.status === "scheduled" &&
          new Date(i.interviewDate).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
      )
      .slice(0, 4);
  }, [interviews]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold tracking-tight">
            Upcoming Interviews
          </h2>
        </div>
        <Link
          href="/jobseeker/interviews"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/40" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-xs font-medium text-foreground">No interviews scheduled</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Once you line one up, it&apos;ll show here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {upcoming.map((interview) => {
            const job = isPopulatedJobId(interview.jobId) ? interview.jobId : null;
            const editHref = job ? `/jobseeker/applications/edit/${job._id}` : "/jobseeker/interviews";
            return (
              <li key={interview._id}>
                <Link
                  href={editHref}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {job?.jobTitle || "Interview"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {job?.companyName || "Company TBD"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {formatDateTime(interview.interviewDate)}
                      </span>
                      {interview.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{interview.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                    {stageLabel[interview.stage] || interview.stage}
                  </Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default UpcomingInterviews;
