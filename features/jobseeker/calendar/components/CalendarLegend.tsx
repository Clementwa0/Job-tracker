import { EVENT_COLORS, type CalendarEventType } from "@/features/jobseeker/calendar/utils/calendar-utils";
import { cn } from "@/lib/utils";

interface Props {
  activeTypes: Set<CalendarEventType>;
  onToggle: (t: CalendarEventType) => void;
  counts?: Partial<Record<CalendarEventType, number>>;
}

export default function CalendarLegend({
  activeTypes,
  onToggle,
  counts,
}: Props) {
  const types = Object.keys(EVENT_COLORS) as CalendarEventType[];

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
        {types.map((t) => {
          const active = activeTypes.has(t);
          const c = EVENT_COLORS[t];

          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full",
                "px-3 py-2 text-xs font-medium transition-all",
                "whitespace-nowrap border",
                "hover:scale-[1.02] active:scale-95",
                "touch-manipulation",
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-border bg-transparent text-muted-foreground border-border text-muted-foreground"
              )}
              style={active ? { backgroundColor: c.bg } : undefined}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? "#fff" : c.bg }}
              />

              <span className="truncate">{c.label}</span>

              {typeof counts?.[t] === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-card/20"
                      : "bg-muted"
                  )}
                >
                  {counts[t]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}