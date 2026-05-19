import type { Job } from "@/types/job";

export function jobToCalendarEvents(jobs: Job[]) {
  return jobs.flatMap((job) => {
    const events = [];

    if (job.applicationDate) {
      events.push({
        id: `${job.id}-applied`,
        title: `📄 Applied: ${job.jobTitle} @ ${job.companyName}`,
        start: job.applicationDate,
        backgroundColor: "#3b82f6",
        extendedProps: { jobId: job.id, type: "applied" },
      });
    }

    if (job.applicationDeadline) {
      events.push({
        id: `${job.id}-deadline`,
        title: `⏰ Deadline: ${job.jobTitle}`,
        start: job.applicationDeadline,
        backgroundColor: "#ef4444",
        extendedProps: { jobId: job.id, type: "deadline" },
      });
    }

    return events;
  });
}
