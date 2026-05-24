import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview";
import { isPopulatedJobId } from "@/types/interview";

export type CalendarEventType =
  | "applied"
  | "deadline"
  | "interview";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  extendedProps: {
    jobId?: string;
    type: CalendarEventType;
    job?: Job;
    interview?: Interview;
    notes?: string;
  };
}

export const EVENT_COLORS: Record<
  CalendarEventType,
  {
    bg: string;
    border: string;
    label: string;
  }
> = {
  applied: {
    bg: "#3b82f6",
    border: "#2563eb",
    label: "Applied",
  },

  deadline: {
    bg: "#ef4444",
    border: "#dc2626",
    label: "Deadline",
  },

  interview: {
    bg: "#8b5cf6",
    border: "#7c3aed",
    label: "Interview",
  },
};

function toISO(
  d: string | Date | undefined
): string | null {
  if (!d) return null;

  try {
    const date =
      typeof d === "string"
        ? new Date(d)
        : d;

    if (isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  } catch {
    return null;
  }
}

export function buildCalendarEvents(
  jobs: Job[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const job of jobs) {
    // Applied event
    const applied = toISO(job.applicationDate);

    if (applied) {
      events.push({
        id: `${job.id}-applied`,
        title: `${job.jobTitle} @ ${job.companyName}`,
        start: applied,
        allDay: true,
        backgroundColor:
          EVENT_COLORS.applied.bg,
        borderColor:
          EVENT_COLORS.applied.border,
        textColor: "#fff",

        extendedProps: {
          jobId: job.id,
          type: "applied",
          job,
        },
      });
    }

    // Deadline event
    const deadline = toISO(
      job.applicationDeadline
    );

    if (deadline) {
      events.push({
        id: `${job.id}-deadline`,
        title: `Deadline · ${job.jobTitle}`,
        start: deadline,
        allDay: true,
        backgroundColor:
          EVENT_COLORS.deadline.bg,
        borderColor:
          EVENT_COLORS.deadline.border,
        textColor: "#fff",

        extendedProps: {
          jobId: job.id,
          type: "deadline",
          job,
        },
      });
    }

    // Interview events
    for (const interview of job.interviews ?? []) {
      const start = toISO(
        interview.interviewDate
      );

      if (!start) continue;

      events.push({
        id: `${job.id}-interview-${interview._id}`,
        title: `${interview.stage} · ${job.jobTitle}`,
        start,

        backgroundColor:
          EVENT_COLORS.interview.bg,

        borderColor:
          EVENT_COLORS.interview.border,

        textColor: "#fff",

        extendedProps: {
          jobId: job.id,
          type: "interview",
          job,
          interview,
        },
      });
    }
  }

  return events;
}

export function buildInterviewEventsFromList(
  interviews: Interview[]
): CalendarEvent[] {
  const events = interviews
    .map((iv) => {
      const start = toISO(iv.interviewDate);

      if (!start) return null;

      const jobRef = isPopulatedJobId(iv.jobId)
        ? iv.jobId
        : null;

      const title = jobRef
        ? `${iv.stage} · ${jobRef.jobTitle} @ ${jobRef.companyName}`
        : `${iv.stage} interview`;

      return {
        id: `iv-${iv._id}`,
        title,
        start,
        backgroundColor: EVENT_COLORS.interview.bg,
        borderColor: EVENT_COLORS.interview.border,
        textColor: "#fff",

        extendedProps: {
          jobId: jobRef?._id,
          type: "interview" as const,
          interview: iv,
          notes: iv.notes,
        },
      } satisfies CalendarEvent;
    })
    .filter(Boolean);

  return events as CalendarEvent[];
}

// Legacy export
export function jobToCalendarEvents(
  jobs: Job[]
) {
  return buildCalendarEvents(jobs);
}