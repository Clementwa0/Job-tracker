import * as Dialog from "@radix-ui/react-dialog";
import { X, Building2, MapPin, ExternalLink, Calendar as CalIcon, Tag } from "lucide-react";
import type { CalendarEvent } from "@/utils/calendar-utils";
import { EVENT_COLORS } from "@/utils/calendar-utils";
import { Link } from "react-router-dom";
import { applicationStatusColors } from "@/types/job";

interface Props {
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetailsDrawer({ event, onClose }: Props) {
  const open = !!event;
  const job = event?.extendedProps.job;
  const interview = event?.extendedProps.interview;
  const type = event?.extendedProps.type;
  const color = type ? EVENT_COLORS[type] : null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in" />
        <Dialog.Content
          className="fixed z-50 right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right
            duration-200 flex flex-col"
        >
          <header className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="min-w-0">
              {color && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white mb-2"
                  style={{ backgroundColor: color.bg }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" /> {color.label}
                </span>
              )}
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {event?.title}
              </Dialog.Title>
              {event && (
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(event.start).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {job && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{job.companyName}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.applicationStatus && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        applicationStatusColors[job.applicationStatus as keyof typeof applicationStatusColors] ?? ""
                      }`}
                    >
                      {job.applicationStatus.replace("_", " ")}
                    </span>
                  </div>
                )}
                {job.jobPostingUrl && (
                  <a
                    href={job.jobPostingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Job posting
                  </a>
                )}
              </section>
            )}

            {interview && (
              <section className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <CalIcon className="h-3.5 w-3.5" /> Interview
                </h4>
                <dl className="grid grid-cols-3 gap-y-1.5 text-xs">
                  <dt className="text-gray-500">Stage</dt>
                  <dd className="col-span-2 font-medium capitalize">{interview.stage}</dd>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="col-span-2 font-medium capitalize">{interview.status}</dd>
                  {interview.location && (
                    <>
                      <dt className="text-gray-500">Where</dt>
                      <dd className="col-span-2">{interview.location}</dd>
                    </>
                  )}
                </dl>
                {interview.notes && (
                  <p className="mt-3 whitespace-pre-wrap rounded bg-gray-50 dark:bg-gray-800/60 p-2 text-xs text-gray-700 dark:text-gray-300">
                    {interview.notes}
                  </p>
                )}
              </section>
            )}

            {job?.notes && (
              <section>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </h4>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{job.notes}</p>
              </section>
            )}
          </div>

          {job && (
            <footer className="border-t border-gray-100 dark:border-gray-800 p-4">
              <Link
                to={`/edit-job/${job.id}`}
                onClick={onClose}
                className="block w-full rounded-md bg-gray-900 dark:bg-white dark:text-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 transition"
              >
                Open job
              </Link>
            </footer>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
