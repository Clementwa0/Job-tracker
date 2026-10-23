"use client";

import { useMemo } from "react";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import type { Job } from "@/types/job";
import { computeJobMetrics, hasOffer, isActiveInterview } from "@/lib/jobs/metrics";
import { compareByDate, toTime } from "@/lib/jobs/dates";
import { APPLICATION_STATUSES, normalizeStatus, statusLabel } from "@/lib/jobs/status";

export type Period = "7d" | "30d" | "90d" | "all";

export const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

/** Length of each period in days; `null` means "everything", with no cut-off. */
const PERIOD_DAYS: Record<Period, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** One colour per application status, so no status is silently dropped from the outcomes chart. */
const STATUS_COLORS: Record<string, string> = {
  applied: "#10B981",
  waiting_response: "#F59E0B",
  interviewing: "#3B82F6",
  offer: "#8B5CF6",
  rejected: "#EF4444",
  ghosted: "#94A3B8",
  completed: "#14B8A6",
};
const UNKNOWN_STATUS_COLOR = "#64748B";

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

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

type Granularity = "day" | "week" | "month";

/**
 * Chart buckets covering [start, today]. Short spans get one point per day;
 * longer ones are grouped by week, then by month, so "All time" stays readable
 * instead of being cut off at 30 days.
 */
function buildBuckets(start: Date, now: Date): { starts: Date[]; granularity: Granularity } {
  const spanDays = Math.max(1, Math.round((startOfDay(now).getTime() - start.getTime()) / DAY_MS) + 1);
  const granularity: Granularity = spanDays <= 90 ? "day" : spanDays <= 400 ? "week" : "month";

  const starts: Date[] = [];
  const cursor = new Date(start);
  if (granularity === "month") cursor.setDate(1);
  while (cursor <= now) {
    starts.push(new Date(cursor));
    if (granularity === "day") cursor.setDate(cursor.getDate() + 1);
    else if (granularity === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
  }
  return { starts, granularity };
}

/** Index of the bucket containing `t`, or -1 when it falls outside the chart. */
function bucketIndex(starts: Date[], t: number, now: number): number {
  if (starts.length === 0 || t < starts[0].getTime() || t > now) return -1;
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid].getTime() <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function useAnalyticsData(period: Period = "30d") {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { interviews, loading: interviewsLoading } = useInterviews();

  const isLoading = jobsLoading || interviewsLoading;

  const data = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const now = new Date();
    const nowTs = now.getTime();

    // "All time" has no cut-off. Every other period starts at local midnight N days ago.
    let periodStart: Date | null = null;
    if (days !== null) {
      periodStart = startOfDay(now);
      periodStart.setDate(periodStart.getDate() - days);
    }

    // When an application happened: its date, falling back to when it was
    // added (the same rule the API's stats use).
    const appliedAt = (j: Job) => toTime(j.applicationDate) ?? toTime(j.createdAt);

    const inPeriod = (t: number | null) =>
      t !== null && (periodStart === null || t >= periodStart.getTime()) && t <= nowTs;

    const jobsInPeriod = jobs.filter((j) => inPeriod(appliedAt(j)));

    // Same-length window just before this one, for a real trend (none for "all").
    let previousCount: number | null = null;
    if (periodStart !== null && days !== null) {
      const prevStart = periodStart.getTime() - days * DAY_MS;
      previousCount = jobs.filter((j) => {
        const t = appliedAt(j);
        return t !== null && t >= prevStart && t < periodStart!.getTime();
      }).length;
    }
    const applicationsTrend =
      previousCount && previousCount > 0
        ? Math.round(((jobsInPeriod.length - previousCount) / previousCount) * 100)
        : null;

    // ---------- Top metrics ----------
    // Applications follows the selected period; the rest look forward
    // (upcoming interviews, open reminders, deadlines), so the period doesn't apply.
    const followUps = jobs.reduce(
      (acc, job) => acc + (job.reminders ?? []).filter((r) => !r.done).length,
      0,
    );

    const deadlineTs = (job: Job) => toTime(job.applicationDeadline);
    const pendingDeadlines = jobs.filter((job) => {
      const d = deadlineTs(job);
      return d !== null && d >= nowTs;
    }).length;

    const upcomingWeekDeadlines = jobs.filter((job) => {
      const d = deadlineTs(job);
      return d !== null && d >= nowTs && d <= nowTs + 7 * DAY_MS;
    }).length;

    const metrics = {
      totalApplications: jobsInPeriod.length,
      applicationsTrend,
      interviewsScheduled: interviews.filter(isActiveInterview).length,
      followUps,
      pendingDeadlines,
      upcomingWeekDeadlines,
    };

    // Shared definitions (lib/jobs/metrics.ts), applied to the selected period.
    const periodMetrics = computeJobMetrics(jobsInPeriod, interviews);

    // ---------- Status outcome breakdown (donut) ----------
    // Every status gets a slice: nothing the user tracks is left out of the total.
    const known = [...APPLICATION_STATUSES] as string[];
    const extra = Object.keys(periodMetrics.statusCounts).filter((k) => !known.includes(k));
    const outcomeSlices = [...known, ...extra]
      .map((status) => ({
        label: statusLabel(status),
        value: periodMetrics.statusCounts[status] ?? 0,
        color: STATUS_COLORS[status] ?? UNKNOWN_STATUS_COLOR,
      }))
      .filter((s) => s.value > 0);

    // ---------- Applications progress (multi-line, cumulative) ----------
    // The chart covers the selected period. For "All time" it starts at the
    // earliest event, so nothing is cut off.
    let chartStart: Date;
    if (periodStart) {
      chartStart = periodStart;
    } else {
      const earliest = Math.min(
        nowTs,
        ...jobs.map(appliedAt).filter((t): t is number => t !== null),
      );
      chartStart = startOfDay(new Date(earliest));
    }
    const { starts, granularity } = buildBuckets(chartStart, now);

    const interviewTimes = interviews
      .filter((i) => i.status !== "canceled")
      .map((i) => toTime(i.createdAt) ?? toTime(i.interviewDate));
    const offerTimes = jobs
      .filter((j) => hasOffer(j))
      .map((j) => toTime(j.offerAt) ?? toTime(j.updatedAt) ?? appliedAt(j));
    const hiredTimes = jobs
      .filter((j) => normalizeStatus(j.applicationStatus) === "completed")
      .map((j) => toTime(j.updatedAt) ?? appliedAt(j));
    const applicationTimes = jobs.map(appliedAt);

    const tally = (times: (number | null)[]) => {
      const counts = new Array<number>(starts.length).fill(0);
      for (const t of times) {
        if (t === null) continue;
        const idx = bucketIndex(starts, t, nowTs);
        if (idx >= 0) counts[idx] += 1;
      }
      return counts;
    };
    const appCounts = tally(applicationTimes);
    const interviewCounts = tally(interviewTimes);
    const offerCounts = tally(offerTimes);
    const hiredCounts = tally(hiredTimes);

    const labelFor = (d: Date) =>
      granularity === "month"
        ? d.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

    const cumulative = (counts: number[]) => {
      const out: number[] = [];
      counts.reduce((sum, n, i) => (out[i] = sum + n), 0);
      return out;
    };
    const appTotals = cumulative(appCounts);
    const interviewTotals = cumulative(interviewCounts);
    const offerTotals = cumulative(offerCounts);
    const hiredTotals = cumulative(hiredCounts);

    const progressSeries = starts.map((d, i) => ({
      label: labelFor(d),
      applications: appTotals[i],
      interviews: interviewTotals[i],
      offers: offerTotals[i],
      hired: hiredTotals[i],
    }));

    // ---------- Applications by source ----------
    const bucketCounts = SOURCE_BUCKETS.map((b) => ({ ...b, count: 0 }));
    for (const job of jobsInPeriod) {
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
    for (const job of jobsInPeriod) {
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
    for (const job of jobsInPeriod) {
      const title = job.jobTitle?.trim() || "Other";
      roleCounts[title] = (roleCounts[title] ?? 0) + 1;
    }
    const topRoles = Object.entries(roleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({
        title,
        count,
        pct: jobsInPeriod.length > 0 ? Math.round((count / jobsInPeriod.length) * 100) : 0,
      }));

    // ---------- Recent applications table ----------
    const recentApplications = [...jobsInPeriod]
      .sort(compareByDate((j: Job) => j.applicationDate, "desc"))
      .slice(0, 6)
      .map((job: Job) => ({
        id: job.id,
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        applicationDate: job.applicationDate,
        status: job.applicationStatus,
        matchScore: job.matchScore,
        nextStep: NEXT_STEP[normalizeStatus(job.applicationStatus)] ?? {
          label: "Review",
          icon: "file" as const,
        },
      }));

    // ---------- Key insights ----------
    const topSkills = skillsData.slice(0, 2).map((s) => s.skill);

    const jobTypeMatch: Record<string, { total: number; count: number }> = {};
    for (const job of jobsInPeriod) {
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
            ? `${jobsInPeriod.length} application${jobsInPeriod.length === 1 ? "" : "s"} · ${PERIOD_LABELS[period].toLowerCase()}`
            : `No applications · ${PERIOD_LABELS[period].toLowerCase()}`,
        description:
          jobsInPeriod.length > 0
            ? `${periodMetrics.interviewRate}% reached an interview and ${periodMetrics.responseRate}% got a response.`
            : "Applications you add will show up here.",
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
            : "Add match details to your applications to surface your top skills here.",
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
      periodTotal: jobsInPeriod.length,
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
