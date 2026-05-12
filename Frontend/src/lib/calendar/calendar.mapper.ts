import type { Job } from "@/types";
import type { CalendarEvent } from "./calendar.types";
import { CALENDAR_COLORS } from "./calendar.constants";

export function jobToCalendarEvents(jobs: Job[]): CalendarEvent[] {
  return jobs.flatMap((job) => {
    const events: CalendarEvent[] = [];

    if (job.applicationDate) {
      events.push({
        id: `${job.id}-applied`,
        title: `Applied: ${job.title} @ ${job.company}`,
        start: job.applicationDate,
        backgroundColor: CALENDAR_COLORS.applied,
        extendedProps: {
          jobId: job.id,
          type: "applied",
        },
      });
    }

    if (job.applicationDeadline) {
      events.push({
        id: `${job.id}-deadline`,
        title: `Deadline: ${job.title}`,
        start: job.applicationDeadline,
        backgroundColor: CALENDAR_COLORS.deadline,
        extendedProps: {
          jobId: job.id,
          type: "deadline",
        },
      });
    }

    return events;
  });
}