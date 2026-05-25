import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

// On mobile we hide timeGrid views and show a compact set
const MOBILE_VIEWS: View[] = ["dayGridMonth", "listWeek"];
const ALL_VIEWS: View[] = ["dayGridMonth", "timeGridWeek", "timeGridDay", "listWeek"];
const ALL_TYPES: CalendarEventType[] = ["applied", "deadline", "interview"];

const Calendar = () => {
  const { jobs } = useJobs();
  const calendarRef = useRef<FullCalendar | null>(null);

  const [view, setView] = useState<View>("dayGridMonth");
  const [activeTypes, setActiveTypes] = useState<Set<CalendarEventType>>(new Set(ALL_TYPES));
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const nav = (dir: "prev" | "next" | "today") => {
    calendarRef.current?.getApi()[dir]();
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 md:p-4 shadow-sm">
        {/* Top row: title + nav + view switcher */}
        <div className="flex items-center justify-between gap-3">
          {/* Title (hidden on xs, shown md+) */}
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Applications, deadlines & interviews in one place.
            </p>
          </div>

          {/* Mobile title */}
          <h2 className="text-base font-semibold text-gray-900 dark:text-white md:hidden">Calendar</h2>

          {/* View switcher — full on md+, compact (icon-only labels) on mobile */}
          <div
            role="tablist"
            aria-label="Calendar view"
            className="inline-flex rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 p-0.5 text-xs md:text-sm ml-auto"
          >
            {/* Mobile: only month + agenda */}
            <div className="flex md:hidden">
              {MOBILE_VIEWS.map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => changeView(v)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                    view === v
                      ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>

            {/* Desktop: all views */}
            <div className="hidden md:flex">
              {ALL_VIEWS.map((v) => (
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
        </div>

        {/* Mobile nav row */}
        <div className="flex items-center gap-2 mt-3 md:hidden">
          <button
            onClick={() => nav("prev")}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => nav("today")}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Today
          </button>
          <button
            onClick={() => nav("next")}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Upcoming toggle (mobile) */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className={`ml-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              sidebarOpen
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            Upcoming
          </button>
        </div>

        <div className="mt-3">
          <CalendarLegend activeTypes={activeTypes} onToggle={toggleType} counts={counts} />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid gap-3 md:gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 md:p-4 shadow-sm fc-themed">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={view}
            height="auto"
            events={filteredEvents}
            eventClick={handleEventClick}
            nowIndicator
            dayMaxEvents={2}
            weekends
            headerToolbar={{
              start: "prev,next today",
              center: "title",
              end: "",
            }}
            buttonText={{ today: "Today" }}
            eventDisplay="block"
            dayHeaderClassNames="text-[10px] md:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400"
            eventClassNames="cursor-pointer rounded-md px-0.5 py-0.5 text-[10px] md:text-xs font-medium shadow-sm hover:opacity-90 transition"
            dayCellClassNames="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            noEventsContent={() => (
              <div className="py-10 text-center text-sm text-gray-500">No events in this range.</div>
            )}
          />
        </div>

        {/* Sidebar — always shown on lg, conditionally shown on smaller screens */}
        <div className={`lg:block ${sidebarOpen ? "block" : "hidden"}`}>
          <AgendaSidebar events={filteredEvents} onSelect={setSelected} />
        </div>
      </div>

      <EventDetailsDrawer event={selected} onClose={() => setSelected(null)} />

      {/* FullCalendar theme overrides */}
      <style>{`
        /* Shrink the header toolbar title on small screens */
        .fc-themed .fc-toolbar-title {
          font-size: clamp(0.8rem, 3vw, 1rem);
          font-weight: 600;
          line-height: 1.2;
        }
        .fc-themed .fc-toolbar {
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .fc-themed .fc-toolbar.fc-header-toolbar {
          margin-bottom: 0.75rem;
        }
        .fc-themed .fc-button {
          background: transparent;
          border: 1px solid rgb(255, 255, 255);
          color: inherit;
          text-transform: capitalize;
          box-shadow: none;
          padding: 0.3rem 0.55rem;
          font-size: 0.75rem;
        }
        .fc-themed .fc-button:hover { background: rgb(231, 231, 231); }
        .fc-themed .fc-button-primary:not(:disabled).fc-button-active,
        .fc-themed .fc-button-primary:not(:disabled):active {
          background: ${EVENT_COLORS.applied.bg};
          color: #ececec;
          border-color: ${EVENT_COLORS.applied.bg};
        }
        .dark .fc-themed .fc-button { border-color: rgb(55 65 81); }
        .dark .fc-themed .fc-button:hover { background: rgb(31 41 55); }
        .fc-themed .fc-daygrid-day-number {
          font-size: 0.72rem;
          color: inherit;
          padding: 2px 4px;
        }
        .fc-themed .fc-day-today { background: rgba(59,130,246,0.06) !important; }
        .dark .fc-themed { color: rgb(242, 242, 243); }
        .dark .fc-themed .fc-scrollgrid,
        .dark .fc-themed td,
        .dark .fc-themed th { border-color: rgb(31 41 55); }
        /* Tighter cells on mobile */
        @media (max-width: 640px) {
          .fc-themed .fc-daygrid-day { min-height: 48px; }
          .fc-themed .fc-col-header-cell-cushion { padding: 4px 2px; }
          .fc-themed .fc-daygrid-day-top { padding: 2px; }
          .fc-themed .fc-toolbar-chunk { display: flex; align-items: center; gap: 2px; }
          .fc-themed .fc-button { padding: 0.25rem 0.45rem; font-size: 0.7rem; }
          .fc-themed .fc-toolbar-title { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
