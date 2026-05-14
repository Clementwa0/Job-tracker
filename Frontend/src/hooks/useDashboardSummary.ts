import { useMemo } from "react";
import { useJobs } from "@/hooks/JobContext";

type Mood = "productive" | "balanced" | "slow" | "warning";

export const useDashboardSummary = () => {
  const { jobs } = useJobs();

  return useMemo(() => {
    const total = jobs.length;

    const interviews = jobs.filter(
      j => j.status?.toLowerCase() === "interviewing"
    ).length;

    const offers = jobs.filter(
      j => j.status?.toLowerCase() === "offer"
    ).length;

    const rejected = jobs.filter(
      j => j.status?.toLowerCase() === "rejected"
    ).length;

    const applied = jobs.filter(
      j => j.status?.toLowerCase() === "applied"
    ).length;

    // ---- MOOD LOGIC ----
    let mood: Mood = "balanced";
    let message = "";
    let subtitle = "";

    if (total === 0) {
      mood = "slow";
      message = "Start your job journey today";
      subtitle = "No applications yet — let’s change that.";
    } 
    else if (offers > 0) {
      mood = "productive";
      message = "Great progress. You're getting offers";
      subtitle = `You already have ${offers} offer(s). Keep going.`;
    } 
    else if (interviews >= 3) {
      mood = "productive";
      message = "Strong momentum. Interviews lined up";
      subtitle = `${interviews} interviews in progress. Stay sharp.`;
    } 
    else if (applied >= 10) {
      mood = "balanced";
      message = "Good effort — keep applying";
      subtitle = `${applied} applications sent. Interviews will come soon.`;
    } 
    else if (rejected >= 5) {
      mood = "warning";
      message = "Don't give up — adjust your strategy";
      subtitle = "Consider improving CV or targeting better roles.";
    } 
    else {
      mood = "balanced";
      message = "Steady progress";
      subtitle = "Keep applying and tracking your progress.";
    }

    // ---- NEXT ACTION ----
    const nextAction =
      interviews > 0
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
        interviews,
        offers,
        rejected,
      },
    };
  }, [jobs]);
};