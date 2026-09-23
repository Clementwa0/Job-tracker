"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import StatCard from "@/features/jobseeker/dashboard/components/StatCard";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { categorizeInterview } from "@/features/jobseeker/interviews/utils/categorize";

const DAY_MS = 24 * 60 * 60 * 1000;

const pctChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const inWindow = (date: Date, start: number, end: number) => {
  const t = date.getTime();
  return !isNaN(t) && t >= start && t < end;
};

const InterviewsStats = () => {
  const { interviews } = useInterviews();
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const curStart = now - 30 * DAY_MS;
    const prevStart = now - 60 * DAY_MS;

    const withDate = interviews.map((i) => ({ ...i, _date: new Date(i.interviewDate) }));

    const upcoming = withDate.filter((i) => categorizeInterview(i, i._date) === "upcoming");
    const completed = withDate.filter((i) => categorizeInterview(i, i._date) === "completed");
    const rescheduled = withDate.filter((i) => categorizeInterview(i, i._date) === "rescheduled");
    const cancelled = withDate.filter((i) => categorizeInterview(i, i._date) === "cancelled");

    const curUpcoming = upcoming.filter((i) => inWindow(i._date, curStart, now)).length;
    const prevUpcoming = upcoming.filter((i) => inWindow(i._date, prevStart, curStart)).length;

    const curCompleted = completed.filter((i) => inWindow(i._date, curStart, now)).length;
    const prevCompleted = completed.filter((i) => inWindow(i._date, prevStart, curStart)).length;

    const curRescheduled = rescheduled.filter((i) => inWindow(new Date(i.updatedAt), curStart, now)).length;
    const prevRescheduled = rescheduled.filter((i) => inWindow(new Date(i.updatedAt), prevStart, curStart)).length;

    const curCancelled = cancelled.filter((i) => inWindow(new Date(i.updatedAt), curStart, now)).length;
    const prevCancelled = cancelled.filter((i) => inWindow(new Date(i.updatedAt), prevStart, curStart)).length;

    return {
      upcoming: upcoming.length,
      upcomingTrend: pctChange(curUpcoming, prevUpcoming),
      completed: completed.length,
      completedTrend: pctChange(curCompleted, prevCompleted),
      rescheduled: rescheduled.length,
      rescheduledTrend: pctChange(curRescheduled, prevRescheduled),
      cancelled: cancelled.length,
      cancelledTrend: pctChange(curCancelled, prevCancelled),
    };
  }, [interviews, now]);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={<CalendarCheck className="h-5 w-5" />}
        iconClass="bg-primary/10 text-primary"
        label="Upcoming Interviews"
        value={stats.upcoming}
        trend={stats.upcomingTrend}
      />
      <StatCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        label="Completed Interviews"
        value={stats.completed}
        trend={stats.completedTrend}
      />
      <StatCard
        icon={<RotateCcw className="h-5 w-5" />}
        iconClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        label="Rescheduled"
        value={stats.rescheduled}
        trend={stats.rescheduledTrend}
      />
      <StatCard
        icon={<XCircle className="h-5 w-5" />}
        iconClass="bg-gold/15 text-gold-foreground dark:text-gold"
        label="Cancelled"
        value={stats.cancelled}
        trend={stats.cancelledTrend}
        trendInverted
      />
    </div>
  );
};

export default InterviewsStats;
