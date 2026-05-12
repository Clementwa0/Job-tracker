export type CalendarEventType = "applied" | "deadline";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  extendedProps: {
    jobId: string;
    type: CalendarEventType;
  };
}