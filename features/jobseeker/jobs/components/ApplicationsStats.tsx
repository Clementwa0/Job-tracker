"use client";

import { useMemo } from "react";
import { Briefcase, CalendarClock, Award, Mail } from "lucide-react";
import StatCard from "@/features/jobseeker/dashboard/components/StatCard";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";

const ApplicationsStats = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();

  const stats = useMemo(() => {
    const total = jobs.length;

    const activeInterviews = interviews.filter(
      (i) => i.status !== "completed" && i.status !== "canceled",
    ).length;

    const offers = jobs.filter(
      (j) => j.applicationStatus?.toLowerCase() === "offer",
    ).length;

    const followUps = jobs.reduce(
      (acc, job) => acc + (job.reminders ?? []).filter((r) => !r.done).length,
      0,
    );

    return { total, activeInterviews, offers, followUps };
  }, [jobs, interviews]);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<Briefcase className="h-4 w-4" />}
        iconClass="bg-primary/10 text-primary"
        label="Applications"
        value={stats.total}
      />
      <StatCard
        icon={<CalendarClock className="h-4 w-4" />}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        label="Interviews"
        value={stats.activeInterviews}
      />
      <StatCard
        icon={<Award className="h-4 w-4" />}
        iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        label="Offers"
        value={stats.offers}
      />
      <StatCard
        icon={<Mail className="h-4 w-4" />}
        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        label="Follow-ups"
        value={stats.followUps}
      />
    </div>
  );
};

export default ApplicationsStats;