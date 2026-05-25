import { useMemo } from "react";
import type { CalendarEvent } from "@/utils/calendar-utils";
import { EVENT_COLORS } from "@/utils/calendar-utils";
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
      className="
        rounded-2xl border border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900
        p-2 sm:p-2
        w-full sm:w-80
        transition-colors
      "
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-gray-500 shrink-0" />

        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Upcoming
        </h3>

        <span className="ml-auto rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] text-gray-500">
          {upcoming.length}
        </span>
      </div>

      {/* Empty State */}
      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Nothing on the calendar.
        </p>
      ) : (
        <ul
          className="
            space-y-2
            max-h-[50vh] sm:max-h-[60vh]
            overflow-y-auto
            pr-1
          "
        >
          {upcoming.map((e) => {
            const w = formatWhen(e.start);
            const c = EVENT_COLORS[e.extendedProps.type];

            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e)}
                  className="
                    w-full rounded-xl border border-gray-100
                    dark:border-gray-800
                    p-3
                    text-left
                    transition-all
                    hover:border-gray-300
                    dark:hover:border-gray-700
                    hover:bg-gray-50
                    dark:hover:bg-gray-800/40
                    active:scale-[0.99]
                  "
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
                        className="
                          truncate
                          text-sm font-medium
                          text-gray-900 dark:text-gray-100
                        "
                      >
                        {e.title.length > 40
                          ? `${e.title.slice(0, 40)}...`
                          : e.title}
                      </p>

                      <div
                        className="
                          mt-1
                          flex flex-wrap items-center gap-x-1 gap-y-0.5
                          text-xs text-gray-500
                        "
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
