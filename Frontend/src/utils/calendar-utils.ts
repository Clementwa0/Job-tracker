import type { Job } from "@/types/job";
import type { Interview } from "@/types/interview";
import { isPopulatedJobId } from "@/types/interview";

export type CalendarEventType = "applied" | "deadline" | "interview" | "reminder";

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
    reminderTitle?: string;
    notes?: string;
  };
}

export const EVENT_COLORS: Record<CalendarEventType, { bg: string; border: string; label: string }> = {
  applied: { bg: "#3b82f6", border: "#2563eb", label: "Applied" },
  deadline: { bg: "#ef4444", border: "#dc2626", label: "Deadline" },
  interview: { bg: "#8b5cf6", border: "#7c3aed", label: "Interview" },
  reminder: { bg: "#f59e0b", border: "#d97706", label: "Reminder" },
};

function toISO(d: string | Date | undefined): string | null {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

export function buildCalendarEvents(jobs: Job[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const job of jobs) {
    if (job.isArchived) continue;

    const applied = toISO(job.applicationDate);
    if (applied) {
      events.push({
        id: `${job.id}-applied`,
        title: `${job.jobTitle} @ ${job.companyName}`,
        start: applied,
        allDay: true,
        backgroundColor: EVENT_COLORS.applied.bg,
        borderColor: EVENT_COLORS.applied.border,
        textColor: "#fff",
        extendedProps: { jobId: job.id, type: "applied", job },
      });
    }

    const deadline = toISO(job.applicationDeadline);
    if (deadline) {
      events.push({
        id: `${job.id}-deadline`,
        title: `Deadline · ${job.jobTitle}`,
        start: deadline,
        allDay: true,
        backgroundColor: EVENT_COLORS.deadline.bg,
        borderColor: EVENT_COLORS.deadline.border,
        textColor: "#fff",
        extendedProps: { jobId: job.id, type: "deadline", job },
      });
    }

    for (const interview of job.interviews ?? []) {
      const start = toISO(interview.interviewDate);
      if (!start) continue;
      events.push({
        id: `${job.id}-interview-${interview._id}`,
        title: `${interview.stage} · ${job.jobTitle}`,
        start,
        backgroundColor: EVENT_COLORS.interview.bg,
        borderColor: EVENT_COLORS.interview.border,
        textColor: "#fff",
        extendedProps: { jobId: job.id, type: "interview", job, interview },
      });
    }

    for (const reminder of job.reminders ?? []) {
      const start = toISO(reminder.dueAt);
      if (!start || reminder.done) continue;
      events.push({
        id: `${job.id}-reminder-${reminder._id ?? reminder.title}`,
        title: `${reminder.title} · ${job.companyName}`,
        start,
        backgroundColor: EVENT_COLORS.reminder.bg,
        borderColor: EVENT_COLORS.reminder.border,
        textColor: "#1f2937",
        extendedProps: { jobId: job.id, type: "reminder", job, reminderTitle: reminder.title },
      });
    }
  }

  return events;
}

export function buildInterviewEventsFromList(
  interviews: Interview[]
): CalendarEvent[] {
  return interviews
    .map<CalendarEvent | null>((iv) => {
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
          type: "interview",
          interview: iv,
          notes: iv.notes,
        },
      };
    })
    .filter((x): x is CalendarEvent => x !== null);
}

// Legacy export for backwards compatibility
export function jobToCalendarEvents(jobs: Job[]) {
  return buildCalendarEvents(jobs);
}
