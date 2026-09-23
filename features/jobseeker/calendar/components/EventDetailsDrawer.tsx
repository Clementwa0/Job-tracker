"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Dialog,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X, Building2, MapPin, ExternalLink, Calendar as CalIcon, Tag } from "lucide-react";
import type { CalendarEvent } from "@/features/jobseeker/calendar/utils/calendar-utils";
import { EVENT_COLORS } from "@/features/jobseeker/calendar/utils/calendar-utils";
import Link from "next/link";
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
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          className={cn(
            "fixed z-50 right-0 top-0 h-full w-full sm:w-[420px]",
            "flex flex-col bg-card border-l border-border shadow-2xl outline-none",
            "duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right"
          )}
        >
          <header className="flex items-start justify-between gap-3 p-5 border-b border-border">
            <div className="min-w-0">
              {color && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white mb-2"
                  style={{ backgroundColor: color.bg }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-card/80" /> {color.label}
                </span>
              )}
              <DialogTitle className="text-lg font-semibold text-foreground truncate">
                {event?.title}
              </DialogTitle>
              {event && (
                <p className="mt-1 text-xs text-muted-foreground">
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
            <DialogClose
              render={
                <button
                  type="button"
                  aria-label="Close"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                />
              }
            >
              <X size={18} />
            </DialogClose>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {job && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{job.companyName}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.applicationStatus && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ applicationStatusColors[job.applicationStatus as keyof typeof applicationStatusColors] ?? "" }`}
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
              <section className="rounded-lg border border-border p-3">
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <CalIcon className="h-3.5 w-3.5" /> Interview
                </h4>
                <dl className="grid grid-cols-3 gap-y-1.5 text-xs">
                  <dt className="text-muted-foreground">Stage</dt>
                  <dd className="col-span-2 font-medium capitalize">{interview.stage}</dd>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="col-span-2 font-medium capitalize">{interview.status}</dd>
                  {interview.location && (
                    <>
                      <dt className="text-muted-foreground">Where</dt>
                      <dd className="col-span-2">{interview.location}</dd>
                    </>
                  )}
                </dl>
                {interview.notes && (
                  <p className="mt-3 whitespace-pre-wrap rounded bg-muted p-2 text-xs text-foreground">
                    {interview.notes}
                  </p>
                )}
              </section>
            )}

            {job?.notes && (
              <section>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </h4>
                <p className="whitespace-pre-wrap text-foreground">{job.notes}</p>
              </section>
            )}
          </div>

          {job && (
            <footer className="border-t border-border p-4">
              <Link
                href={`/applications/edit/${job.id}`}
                onClick={onClose}
                className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
              >
                Open job
              </Link>
            </footer>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
