import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useJobs } from "@/hooks/JobContext";
import { jobToCalendarEvents } from "@/lib/calendar-utils";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Job } from "@/components/pages/Jobs/JobsTable";

const Calendar = () => {
  const { jobs } = useJobs();
  const events = jobToCalendarEvents(jobs);

const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleEventClick = (info: any) => {
    const jobId = info.event.extendedProps.jobId;
    const job = jobs.find((j) => j.id === jobId);
    if (job) setSelectedJob(job);
  };

  const closeModal = () => setSelectedJob(null);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Job Calendar
      </h2>

      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dayHeaderClassNames="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white font-semibold uppercase"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth",
          }}
          eventClassNames={(arg) =>
            `px-2 py-1 text-sm font-medium rounded-md shadow-sm ${
              arg.event.backgroundColor === "#3b82f6"
                ? "bg-blue-500 text-white"
                : arg.event.backgroundColor === "#ef4444"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`
          }
          dayCellClassNames="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        />
      </div>

      {/* Modal */}
      <Dialog.Root open={!!selectedJob} onOpenChange={closeModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedJob?.title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>
                <strong>Company:</strong> {selectedJob?.company}
              </p>
              <p>
                <strong>Status:</strong> {selectedJob?.status}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
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
              <p>
                <strong>Next Steps:</strong>{" "}
                {selectedJob?.nextStepsDate
                  ? new Date(selectedJob.nextStepsDate).toLocaleDateString()
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
