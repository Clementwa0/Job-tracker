"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Mail,
  Plus,
  Search,
  FileUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import {
  buildCalendarEvents,
  buildInterviewEventsFromList,
  type CalendarEvent,
  type CalendarEventType,
} from "@/features/jobseeker/calendar/utils/calendar-utils";
import { isPopulatedJobId } from "@/types/interview";

const ICONS: Record<CalendarEventType, React.ElementType> = {
  interview: CalendarClock,
  applied: CheckCircle2,
  deadline: Mail,
  reminder: Mail,
};

const ICON_BG: Record<CalendarEventType, string> = {
  interview: "bg-primary/10 text-primary",
  applied: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  deadline: "bg-gold/15 text-gold-foreground dark:text-gold",
  reminder: "bg-gold/15 text-gold-foreground dark:text-gold",
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const TodaySchedule = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();

  const todaysEvents = useMemo(() => {
    const fromJobs = buildCalendarEvents(jobs).filter(
      (e) => e.extendedProps.type !== "interview",
    );
    const fromInterviews = buildInterviewEventsFromList(interviews);
    const all: CalendarEvent[] = [...fromJobs, ...fromInterviews];

    const today = new Date();
    return all
      .filter((e) => {
        const d = new Date(e.start);
        return (
          !isNaN(d.getTime()) &&
          d.toDateString() === today.toDateString()
        );
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  }, [jobs, interviews]);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Today&apos;s Schedule
        </h2>
        <span className="text-xs text-muted-foreground">
          {todaysEvents.length} event{todaysEvents.length === 1 ? "" : "s"}
        </span>
      </div>

      {todaysEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">Nothing scheduled today</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {todaysEvents.map((e) => {
            const Icon = ICONS[e.extendedProps.type];
            const job = e.extendedProps.job;
            const iv = e.extendedProps.interview;
            const jobLabel = job
              ? `${job.companyName} - ${job.jobTitle}`
              : iv && isPopulatedJobId(iv.jobId)
              ? `${iv.jobId.companyName} - ${iv.jobId.jobTitle}`
              : "";

            return (
              <li
                key={e.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ICON_BG[e.extendedProps.type]}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {e.title.split(" · ")[0]}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {timeLabel(e.start)}
                    {jobLabel ? ` · ${jobLabel}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          Quick Actions
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/jobseeker/calendar"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Add Event
          </Link>
          <Link
            href="/job-board"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Search className="h-3.5 w-3.5" />
            Find Jobs
          </Link>
          <Link
            href="/jobseeker/applications/add"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Application
          </Link>
          <Link
            href="/jobseeker/resumes"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <FileUp className="h-3.5 w-3.5" />
            Upload Resume
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default TodaySchedule;
