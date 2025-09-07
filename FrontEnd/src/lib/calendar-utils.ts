import type { Job } from "@/components/pages/Jobs/JobsTable";

export function jobToCalendarEvents(jobs: Job[]) {
  return jobs.flatMap((job) => {
    const events = [];

    if (job.applicationDate) {
      events.push({
        id: `${job.id}-applied`,
        title: `📄 Applied: ${job.title} @ ${job.company}`,
        start: job.applicationDate,
        backgroundColor: "#3b82f6", // blue
        extendedProps: { jobId: job.id, type: "applied" },
      });
    }

    if (job.applicationDeadline) {
      events.push({
        id: `${job.id}-deadline`,
        title: `⏰ Deadline: ${job.title}`,
        start: job.applicationDeadline,
        backgroundColor: "#ef4444", // red
        extendedProps: { jobId: job.id, type: "deadline" },
      });
    }


    return events;
  });
}
