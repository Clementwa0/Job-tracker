"use client";

import { useMemo } from "react";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import type { Job } from "@/types/job";

export type Period = "7d" | "30d" | "90d" | "all";

export const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

const PERIOD_DAYS: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: 365,
};

const SOURCE_BUCKETS: { label: string; color: string; match: (s: string) => boolean }[] = [
  {
    label: "Job Sites (Indeed, LinkedIn, etc.)",
    color: "#3B82F6",
    match: (s) => ["linkedin", "indeed", "glassdoor", "angellist"].includes(s),
  },
  {
    label: "Company Careers",
    color: "#10B981",
    match: (s) => s === "company website",
  },
  {
    label: "Referrals",
    color: "#8B5CF6",
    match: (s) => s === "referral",
  },
  {
    label: "Other",
    color: "#F59E0B",
    match: () => true,
  },
];

const NEXT_STEP: Record<string, { label: string; icon: "calendar" | "clock" | "mail" | "file" }> = {
  applied: { label: "Follow up", icon: "clock" },
  interviewing: { label: "Prepare for interview", icon: "calendar" },
  offer: { label: "Respond to offer", icon: "mail" },
  waiting_response: { label: "Check deadline", icon: "clock" },
  rejected: { label: "View feedback", icon: "file" },
  ghosted: { label: "Send follow-up", icon: "mail" },
  completed: { label: "Archive", icon: "file" },
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function safeDate(v?: string | Date | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function useAnalyticsData(period: Period = "30d") {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { interviews, loading: interviewsLoading } = useInterviews();

  const isLoading = jobsLoading || interviewsLoading;

  const data = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);
    periodStart.setHours(0, 0, 0, 0);

    const jobsInPeriod = jobs.filter((j) => {
      const d = safeDate(j.applicationDate);
      return d ? d >= periodStart : false;
    });

    // ---------- Top metrics ----------
    const activeInterviews = interviews.filter(
      (i) => i.status !== "completed" && i.status !== "canceled",
    ).length;

    const followUps = jobs.reduce(
      (acc, job) => acc + (job.reminders ?? []).filter((r) => !r.done).length,
      0,
    );

    const nowTs = Date.now();
    const pendingDeadlines = jobs.filter((job) => {
      if (!job.applicationDeadline) return false;
      const d = new Date(job.applicationDeadline).getTime();
      return !isNaN(d) && d >= nowTs;
    }).length;

    const upcomingWeekDeadlines = jobs.filter((job) => {
      if (!job.applicationDeadline) return false;
      const d = new Date(job.applicationDeadline).getTime();
      return !isNaN(d) && d >= nowTs && d <= nowTs + 7 * 24 * 60 * 60 * 1000;
    }).length;

    const metrics = {
      totalApplications: jobs.length,
      interviewsScheduled: activeInterviews,
      followUps,
      pendingDeadlines,
      upcomingWeekDeadlines,
    };

    // ---------- Status outcome breakdown (donut) ----------
    const statusCounts: Record<string, number> = {};
    for (const job of jobs) {
      statusCounts[job.applicationStatus] = (statusCounts[job.applicationStatus] ?? 0) + 1;
    }
    const outcomeSlices = [
      { label: "Applied", value: statusCounts["applied"] ?? 0, color: "#10B981" },
      { label: "Interview", value: statusCounts["interviewing"] ?? 0, color: "#3B82F6" },
      { label: "Offer", value: statusCounts["offer"] ?? 0, color: "#8B5CF6" },
      { label: "Rejected", value: statusCounts["rejected"] ?? 0, color: "#EF4444" },
    ].filter((s) => s.value > 0);

    // ---------- Applications progress (multi-line, cumulative) ----------
    const chartDays = Math.min(days, 30);
    const dayList: Date[] = Array.from({ length: chartDays }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (chartDays - 1 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const interviewDates = interviews
      .map((i) => safeDate(i.createdAt) ?? safeDate(i.interviewDate))
      .filter((d): d is Date => !!d);

    const offerDates = jobs
      .filter((j) => j.applicationStatus === "offer")
      .map((j) => safeDate(j.updatedAt) ?? safeDate(j.applicationDate))
      .filter((d): d is Date => !!d);

    const hiredDates = jobs
      .filter((j) => j.applicationStatus === "completed")
      .map((j) => safeDate(j.updatedAt) ?? safeDate(j.applicationDate))
      .filter((d): d is Date => !!d);

    const applicationDates = jobs
      .map((j) => safeDate(j.applicationDate))
      .filter((d): d is Date => !!d);

    const countByDay = (dates: Date[], key: string) =>
      dates.filter((d) => dayKey(d) === key).length;

    let runningApplications = 0;
    let runningInterviews = 0;
    let runningOffers = 0;
    let runningHired = 0;

    const progressSeries = dayList.map((d) => {
      const key = dayKey(d);
      runningApplications += countByDay(applicationDates, key);
      runningInterviews += countByDay(interviewDates, key);
      runningOffers += countByDay(offerDates, key);
      runningHired += countByDay(hiredDates, key);
      return {
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        applications: runningApplications,
        interviews: runningInterviews,
        offers: runningOffers,
        hired: runningHired,
      };
    });

    // ---------- Applications by source ----------
    const bucketCounts = SOURCE_BUCKETS.map((b) => ({ ...b, count: 0 }));
    for (const job of jobs) {
      const s = (job.source || "other").toLowerCase();
      const bucket = bucketCounts.find((b) => b.match(s)) ?? bucketCounts[bucketCounts.length - 1];
      bucket.count += 1;
    }
    const sourceData = bucketCounts
      .map((b) => ({ label: b.label, value: b.count, color: b.color }))
      .filter((b) => b.value > 0);

    // ---------- Skills / matched keywords ----------
    const keywordCounts: Record<string, number> = {};
    let jobsWithMatch = 0;
    for (const job of jobs) {
      const matched = job.matchAnalysis?.keywords?.matched ?? [];
      if (matched.length > 0) jobsWithMatch += 1;
      for (const kw of matched) {
        const key = kw.trim();
        if (!key) continue;
        keywordCounts[key] = (keywordCounts[key] ?? 0) + 1;
      }
    }
    const skillsData = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({
        skill,
        rate: jobsWithMatch > 0 ? Math.round((count / jobsWithMatch) * 100) : 0,
      }));

    // ---------- Top job roles ----------
    const roleCounts: Record<string, number> = {};
    for (const job of jobs) {
      const title = job.jobTitle?.trim() || "Other";
      roleCounts[title] = (roleCounts[title] ?? 0) + 1;
    }
    const topRoles = Object.entries(roleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({
        title,
        count,
        pct: jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0,
      }));

    // ---------- Recent applications table ----------
    const recentApplications = [...jobs]
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
      .slice(0, 6)
      .map((job: Job) => ({
        id: job.id,
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        applicationDate: job.applicationDate,
        status: job.applicationStatus,
        matchScore: job.matchScore,
        nextStep: NEXT_STEP[job.applicationStatus] ?? { label: "Review", icon: "file" as const },
      }));

    // ---------- Key insights ----------
    const interviewRate =
      jobs.length > 0
        ? Math.round(((statusCounts["interviewing"] ?? 0) / jobs.length) * 100)
        : 0;

    const topSkills = skillsData.slice(0, 2).map((s) => s.skill);

    const jobTypeMatch: Record<string, { total: number; count: number }> = {};
    for (const job of jobs) {
      if (typeof job.matchScore !== "number") continue;
      const type = job.jobType || "role";
      jobTypeMatch[type] = jobTypeMatch[type] ?? { total: 0, count: 0 };
      jobTypeMatch[type].total += job.matchScore;
      jobTypeMatch[type].count += 1;
    }
    const bestType = Object.entries(jobTypeMatch)
      .map(([type, v]) => ({ type, avg: Math.round(v.total / v.count) }))
      .sort((a, b) => b.avg - a.avg)[0];

    const insights = [
      {
        icon: "trending" as const,
        title:
          jobsInPeriod.length > 0
            ? `${jobsInPeriod.length} applications in the ${PERIOD_LABELS[period].toLowerCase()}`
            : "No applications yet this period",
        description: `Your interview rate is ${interviewRate}%. Keep the momentum going!`,
      },
      {
        icon: "target" as const,
        title:
          topSkills.length > 0
            ? `${topSkills.join(" and ")} ${topSkills.length > 1 ? "are" : "is"} your strongest match`
            : "Add job descriptions to see skill matches",
        description:
          topSkills.length > 0
            ? "These show up most often in your matched applications."
            : "Run resume matching on a job to surface your top skills here.",
      },
      {
        icon: "lightbulb" as const,
        title: bestType
          ? `Best match: ${bestType.type} roles (${bestType.avg}%)`
          : "Consider applying to more roles",
        description: bestType
          ? "You tend to score highest on this job type - look for more like it."
          : "Add match scores to your applications to get tailored suggestions.",
      },
      {
        icon: "shield" as const,
        title:
          upcomingWeekDeadlines > 0
            ? `${upcomingWeekDeadlines} deadline${upcomingWeekDeadlines === 1 ? "" : "s"} next 7 days`
            : "No deadlines coming up",
        description:
          upcomingWeekDeadlines > 0
            ? "Make sure to complete them on time."
            : "You're all caught up on application deadlines.",
      },
    ];

    return {
      metrics,
      outcomeSlices,
      progressSeries,
      sourceData,
      skillsData,
      topRoles,
      recentApplications,
      insights,
    };
  }, [jobs, interviews, period]);

  return { ...data, isLoading };
}
