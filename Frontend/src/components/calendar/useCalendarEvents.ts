import { useMemo } from "react";
import type { Job } from "@/types";
import { jobToCalendarEvents } from "@/lib/calendar/calendar.mapper";

export const useCalendarEvents = (jobs: Job[]) => {
  return useMemo(() => {
    return jobToCalendarEvents(jobs);
  }, [jobs]);
};