"use client";

import { useMemo } from "react";
import type { CalendarEvent } from "@/features/jobseeker/calendar/utils/calendar-utils";
import { EVENT_COLORS } from "@/features/jobseeker/calendar/utils/calendar-utils";
import { CalendarClock } from "lucide-react";

interface Props {
  events: CalendarEvent[];
  onSelect: (e: CalendarEvent) => void;
  limit?: number;
}

function formatWhen(iso: string) {
  const d = new Date(iso);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(d);
  eventDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (eventDate.getTime() - today.getTime()) / 86_400_000,
  );

  const date = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const rel =
    diffDays === 0
      ? "Today"
      : diffDays === 1
        ? "Tomorrow"
        : diffDays < 0
          ? `${-diffDays}d ago`
          : `in ${diffDays}d`;

  return { date, time, rel };
}

export default function AgendaSidebar({ events, onSelect, limit = 8 }: Props) {
  const upcoming = useMemo(() => {
    const now = Date.now();

    return [...events]
      .filter((e) => new Date(e.start).getTime() >= now - 24 * 3600 * 1000)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, limit);
  }, [events, limit]);

  return (
    <aside
      className="rounded-2xl border border-border bg-card p-2 sm:p-2 w-full sm:w-80 transition-colors"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />

        <h3 className="text-sm font-semibold text-foreground">
          Upcoming
        </h3>

        <span className="ml-auto rounded-full bg-muted bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
          {upcoming.length}
        </span>
      </div>

      {/* Empty State */}
      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nothing on the calendar.
        </p>
      ) : (
        <ul
          className="space-y-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1"
        >
          {upcoming.map((e) => {
            const w = formatWhen(e.start);
            const c = EVENT_COLORS[e.extendedProps.type];

            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e)}
                  className="w-full rounded-xl border border-border p-3 text-left transition-all hover:border-muted-foreground/40 hover:bg-muted hover:bg-muted/40 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    {/* Status Dot */}
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: c.bg }}
                      aria-hidden
                    />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-foreground"
                      >
                        {e.title.length > 40
                          ? `${e.title.slice(0, 40)}...`
                          : e.title}
                      </p>

                      <div
                        className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground"
                      >
                        <span>{w.date}</span>
                        <span>•</span>
                        <span>{w.time}</span>

                        <span className="opacity-70">({w.rel})</span>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
