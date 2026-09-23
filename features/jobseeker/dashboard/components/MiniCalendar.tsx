"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import {
  buildCalendarEvents,
  buildInterviewEventsFromList,
  EVENT_COLORS,
  type CalendarEvent,
} from "@/features/jobseeker/calendar/utils/calendar-utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(anchor: Date) {
  const first = startOfMonth(anchor);
  // Monday-first offset
  const offset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - offset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const MiniCalendar = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();
  const [anchor, setAnchor] = useState(() => new Date());

  const events = useMemo<CalendarEvent[]>(() => {
    const fromJobs = buildCalendarEvents(jobs).filter(
      (e) => e.extendedProps.type !== "interview",
    );
    const fromInterviews = buildInterviewEventsFromList(interviews);
    return [...fromJobs, ...fromInterviews];
  }, [jobs, interviews]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const d = new Date(e.start);
      if (isNaN(d.getTime())) continue;
      const key = d.toDateString();
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  const days = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const today = new Date();

  const monthLabel = anchor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight">
            Upcoming Schedule
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/jobseeker/calendar"
            className="text-xs font-medium text-primary hover:underline"
          >
            View Calendar
          </Link>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))
              }
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))
              }
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="mb-2 text-sm font-medium text-foreground">{monthLabel}</p>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const isToday = sameDay(d, today);
          const dayEvents = eventsByDay.get(d.toDateString()) ?? [];

          return (
            <div
              key={i}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-xs",
                !inMonth && "text-muted-foreground/40",
                inMonth && "text-foreground",
                isToday && "bg-primary text-primary-foreground font-semibold",
              )}
            >
              <span>{d.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="flex items-center gap-0.5">
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <span
                      key={idx}
                      className="h-1 w-1 rounded-full"
                      style={{
                        backgroundColor: isToday
                          ? "currentColor"
                          : EVENT_COLORS[e.extendedProps.type].bg,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MiniCalendar;
