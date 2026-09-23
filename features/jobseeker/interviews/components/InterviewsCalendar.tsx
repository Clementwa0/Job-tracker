"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildMonthGrid(anchor: Date) {
  const first = startOfMonth(anchor);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const InterviewsCalendar = () => {
  const { interviews } = useInterviews();
  const [anchor, setAnchor] = useState(() => new Date());

  const datesWithInterviews = useMemo(() => {
    const set = new Set<string>();
    for (const i of interviews) {
      const d = new Date(i.interviewDate);
      if (!isNaN(d.getTime())) set.add(d.toDateString());
    }
    return set;
  }, [interviews]);

  const days = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const today = new Date();

  const monthLabel = anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

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
          const hasInterview = datesWithInterviews.has(d.toDateString());

          return (
            <div
              key={i}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md text-xs",
                !inMonth && "text-muted-foreground/40",
                inMonth && "text-foreground",
                isToday && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              <span>{d.getDate()}</span>
              {hasInterview && (
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ backgroundColor: isToday ? "currentColor" : "var(--color-primary)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InterviewsCalendar;
