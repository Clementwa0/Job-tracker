"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, CalendarClock, Mail, CheckCircle2 } from "lucide-react";
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
  deadline: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  reminder: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const relativeDay = (d: Date) => {
  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 14) return `In ${diffDays} days`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const UpcomingEvents = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();

  const upcoming = useMemo(() => {
    const fromJobs = buildCalendarEvents(jobs).filter(
      (e) => e.extendedProps.type !== "applied",
    );
    const fromInterviews = buildInterviewEventsFromList(interviews);
    const all: CalendarEvent[] = [...fromJobs, ...fromInterviews];
    const now = Date.now();

    return all
      .filter((e) => {
        const d = new Date(e.start).getTime();
        return !isNaN(d) && d >= now;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 4);
  }, [jobs, interviews]);

  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight">
          Upcoming Events
        </h2>
        <Link
          href="/jobseeker/calendar"
          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-6 text-center">
          <p className="text-xs text-muted-foreground">No upcoming events</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((e) => {
            const Icon = ICONS[e.extendedProps.type];
            const job = e.extendedProps.job;
            const iv = e.extendedProps.interview;
            const jobLabel = job
              ? job.companyName
              : iv && isPopulatedJobId(iv.jobId)
                ? iv.jobId.companyName
                : "";
            const d = new Date(e.start);

            return (
              <li key={e.id} className="flex items-start gap-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ICON_BG[e.extendedProps.type]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-foreground">
                    {e.title.split(" · ")[0]}
                    {jobLabel ? ` - ${jobLabel}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground">
                    {relativeDay(d)} ·{" "}
                    {d.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default UpcomingEvents;