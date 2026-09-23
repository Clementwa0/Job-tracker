"use client";

import { useMemo } from "react";
import Jobs from "@/features/jobseeker/jobs/components/Jobs";
import ApplicationsStats from "@/features/jobseeker/jobs/components/ApplicationsStats";
import UpcomingEvents from "@/features/jobseeker/jobs/components/UpcomingEvents";
import ReadyForNextStep from "@/features/jobseeker/jobs/components/ReadyForNextStep";
import ApplicationProgressDonut from "@/components/shared/Dashboard/ApplicationProgressDonut";
import KeepGoingCard from "@/features/jobseeker/dashboard/components/KeepGoingCard";
import { JobProvider, useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import type { ApplicationStatus } from "@/types/job";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3B82F6",
  interviewing: "#8B5CF6",
  offer: "#F59E0B",
  rejected: "#EF4444",
  waiting_response: "#06B6D4",
  ghosted: "#64748B",
  completed: "#10B981",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  interviewing: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  waiting_response: "Awaiting response",
  ghosted: "Ghosted",
  completed: "Completed",
};

const ApplicationsBody = () => {
  const { jobs } = useJobs();

  const { total, slices } = useMemo(() => {
    const counts: Partial<Record<ApplicationStatus, number>> = {};
    for (const job of jobs) {
      const status = job.applicationStatus as ApplicationStatus;
      counts[status] = (counts[status] ?? 0) + 1;
    }
    const order: ApplicationStatus[] = ["applied", "interviewing", "offer", "rejected"];
    const slices = order
      .filter((s) => counts[s])
      .map((s) => ({
        label: STATUS_LABELS[s] ?? s,
        value: counts[s] ?? 0,
        color: STATUS_COLORS[s] ?? "#94a3b8",
      }));
    return { total: jobs.length, slices };
  }, [jobs]);

  return (
    <div className="space-y-4">
      <ApplicationsStats />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Jobs />
        </div>

        <div className="space-y-3">
          <ApplicationProgressDonut total={total} slices={slices} showViewAll={false} />
          <UpcomingEvents />
          <KeepGoingCard />
          <ReadyForNextStep />
        </div>
      </div>
    </div>
  );
};

const ApplicationsPage = () => (
  <JobProvider>
    <ApplicationsBody />
  </JobProvider>
);

export default ApplicationsPage;