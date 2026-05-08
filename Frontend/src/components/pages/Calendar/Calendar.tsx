import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { EventClickArg } from "@fullcalendar/core";

import { useJobs } from "@/hooks/useJobs"; // ✅ FIXED
import { jobToCalendarEvents } from "@/lib/calendar-utils";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Job } from "@/types";

const Calendar = () => {
  const { data: jobs = [] } = useJobs(); // ✅ FIXED

  const events = jobToCalendarEvents(jobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleEventClick = (info: EventClickArg) => {
    const jobId = info.event.extendedProps.jobId as string;
    const job = jobs.find((j) => j.id === jobId);
    if (job) setSelectedJob(job);
  };

  const closeModal = () => setSelectedJob(null);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border">
      <h2 className="text-xl font-semibold mb-4">Job Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={events}
        eventClick={handleEventClick}
      />

      {/* Modal */}
      <Dialog.Root open={!!selectedJob} onOpenChange={closeModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />

          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-xl">
            <div className="flex justify-between mb-4">
              <Dialog.Title className="font-bold">
                {selectedJob?.title}
              </Dialog.Title>

              <Dialog.Close asChild>
                <button>
                  <X size={14} />
                </button>
              </Dialog.Close>
            </div>

            <div className="text-sm space-y-2">
              <p><strong>Company:</strong> {selectedJob?.company}</p>
              <p><strong>Status:</strong> {selectedJob?.status}</p>
              <p>
                <strong>Applied:</strong>{" "}
                {selectedJob?.applicationDate
                  ? new Date(selectedJob.applicationDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {selectedJob?.applicationDeadline
                  ? new Date(selectedJob.applicationDeadline).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default Calendar;