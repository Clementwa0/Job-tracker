import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg } from "@fullcalendar/core";

import { useJobs } from "@/hooks/JobContext";
import {
  buildCalendarEvents,
  EVENT_COLORS,
  type CalendarEvent,
  type CalendarEventType,
} from "@/utils/calendar-utils";
import { AgendaSidebar, CalendarLegend, EventDetailsDrawer } from "@/components";


type View = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

const VIEW_LABELS: Record<View, string> = {
  dayGridMonth: "Month",
  timeGridWeek: "Week",
  timeGridDay: "Day",
  listWeek: "Agenda",
};

const ALL_TYPES: CalendarEventType[] = ["applied", "deadline", "interview"];

const Calendar = () => {
  const { jobs } = useJobs();
  const calendarRef = useRef<FullCalendar | null>(null);

  const [view, setView] = useState<View>("dayGridMonth");
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const allEvents = useMemo(() => buildCalendarEvents(jobs), [jobs]);

  const counts = useMemo(() => {
    const c: Partial<Record<CalendarEventType, number>> = {};
    for (const e of allEvents) c[e.extendedProps.type] = (c[e.extendedProps.type] ?? 0) + 1;
    return c;
  }, [allEvents]);

  const filteredEvents = useMemo(
    () => allEvents.filter((e) => activeTypes.has(e.extendedProps.type)),
    [allEvents, activeTypes],
  );

  const toggleType = (t: CalendarEventType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const handleEventClick = (info: EventClickArg) => {
    const id = info.event.id;
    const event = allEvents.find((e) => e.id === id) ?? null;
    setSelected(event);
  };

  const changeView = (v: View) => {
    setView(v);
    calendarRef.current?.getApi().changeView(v);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Applications, deadlines, interviews and reminders in one place.
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Calendar view"
            className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-1 text-sm"
          >
            {(Object.keys(VIEW_LABELS) as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => changeView(v)}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  view === v
                    ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <CalendarLegend activeTypes={activeTypes} onToggle={toggleType} counts={counts} />
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm fc-themed">
          <FullCalendar
          
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={view}
            height="auto"
            events={filteredEvents}
            eventClick={handleEventClick}
            nowIndicator
            dayMaxEvents={3}
            weekends
            headerToolbar={{
              start: "prev,next today",
              center: "title",
              end: "",
            }}
            buttonText={{ today: "Today" }}
            eventDisplay="block"
            dayHeaderClassNames="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            eventClassNames="cursor-pointer rounded-md  px-0.5 py-0.5 text-xs font-medium shadow-sm hover:opacity-90 transition"
            dayCellClassNames=" hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            noEventsContent={() => (
              <div className="py-10 text-center text-sm text-gray-500">No events in this range.</div>
            )}
          />
        </div>

        <AgendaSidebar events={filteredEvents} onSelect={setSelected} />
      </div>

      <EventDetailsDrawer event={selected} onClose={() => setSelected(null)} />

      {/* Local style polish for FullCalendar in dark mode */}
      <style>{`
        .fc-themed .fc-toolbar-title { font-size: 1rem; font-weight: 600; }
        .fc-themed .fc-button {
          background: transparent; border: 1px solid rgb(229 231 235); color: inherit;
          text-transform: capitalize; box-shadow: none; padding: 0.35rem 0.65rem; font-size: 0.8rem;
        }
        .fc-themed .fc-button:hover { background: rgb(243 244 246); }
        .fc-themed .fc-button-primary:not(:disabled).fc-button-active,
        .fc-themed .fc-button-primary:not(:disabled):active {
          background: ${EVENT_COLORS.applied.bg}; color: #fff; border-color: ${EVENT_COLORS.applied.bg};
        }
        .dark .fc-themed .fc-button { border-color: rgb(55 65 81); }
        .dark .fc-themed .fc-button:hover { background: rgb(31 41 55); }
        .fc-themed .fc-daygrid-day-number { font-size: 0.8rem; color: inherit; }
        .fc-themed .fc-day-today { background: rgba(59,130,246,0.06) !important; }
        .dark .fc-themed { color: rgb(229 231 235); }
        .dark .fc-themed .fc-scrollgrid, .dark .fc-themed td, .dark .fc-themed th { border-color: rgb(31 41 55); }
      `}</style>
    </div>
  );
};

export default Calendar;
