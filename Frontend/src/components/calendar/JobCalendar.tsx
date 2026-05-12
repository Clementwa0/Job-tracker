import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg } from "@fullcalendar/core";

import { useJobs } from "@/hooks/useJobs";
import { useState } from "react";
import type { Job } from "@/types";

import { useCalendarEvents } from "./useCalendarEvents";
import CalendarModal from "./CalendarModal";

const JobCalendar = () => {
  const { data: jobs = [] } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const events = useCalendarEvents(jobs);

  const handleEventClick = (info: EventClickArg) => {
    const jobId = info.event.extendedProps?.jobId;
    const job = jobs.find((j) => j.id === jobId);
    if (job) setSelectedJob(job);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border">
      
      <h2 className="text-xl font-semibold mb-4">
        Job Calendar
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        eventClick={handleEventClick}
      />

      <CalendarModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
};

export default JobCalendar;