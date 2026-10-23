"use client";

import { useMemo } from "react";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useInterviews } from "@/features/jobseeker/interviews/hooks/useInterviews";
import { computeJobMetrics } from "@/lib/jobs/metrics";
import { toTime } from "@/lib/jobs/dates";

type Mood = "productive" | "balanced" | "slow" | "warning";

export const useDashboardSummary = () => {
  const { jobs } = useJobs();
  const { interviews } = useInterviews();

  return useMemo(() => {
    const metrics = computeJobMetrics(jobs, interviews);
    const total = metrics.total;
    // Same definitions as the stat cards and analytics (lib/jobs/metrics.ts).
    const interviewing = metrics.statusCounts["interviewing"] ?? 0;
    const offers = metrics.offers;
    const rejected = metrics.rejected;
    const applied = metrics.statusCounts["applied"] ?? 0;

    // Applications submitted in the last 7 days (any status) - what "this week" means.
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const appliedLast7Days = jobs.filter((j) => {
      const t = toTime(j.applicationDate);
      return t !== null && t >= weekAgo && t <= Date.now();
    }).length;

    // ---- MOOD LOGIC ----
    let mood: Mood = "balanced";
    let message = "";
    let subtitle = "";

    if (total === 0) {
      mood = "slow";
      message = "Start your job journey today";
      subtitle = "No applications yet - let’s change that.";
    } 
    else if (offers > 0) {
      mood = "productive";
      message = "Great progress. You're getting offers";
      subtitle = `You already have ${offers} offer(s). Keep going.`;
    } 
    else if (interviewing >= 3) {
      mood = "productive";
      message = "Strong momentum. Interviews lined up";
      subtitle = `${interviewing} interviews in progress. Stay sharp.`;
    } 
    else if (applied >= 10) {
      mood = "balanced";
      message = "Good effort - keep applying";
      subtitle = `${applied} applications sent. Interviews will come soon.`;
    } 
    else if (rejected >= 5) {
      mood = "warning";
      message = "Don't give up - adjust your strategy";
      subtitle = "Consider updating your profile or targeting better roles.";
    } 
    else {
      mood = "balanced";
      message = "Steady progress";
      subtitle = "Keep applying and tracking your progress.";
    }

    // ---- NEXT ACTION ----
    const nextAction =
      interviewing > 0
        ? "Prepare for upcoming interviews"
        : applied < 5
        ? "Apply to at least 5 jobs today"
        : "Follow up on pending applications";

    return {
      mood,
      message,
      subtitle,
      nextAction,
      stats: {
        total,
        applied,
        appliedLast7Days,
        interviews: interviewing,
        offers,
        rejected,
      },
    };
  }, [jobs, interviews]);
};