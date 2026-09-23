"use client";

import { Navigation, MessageSquare, CheckCircle2, Target } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats } from "@/features/jobseeker/dashboard/hooks/useDashboardStats";

/**
 * Caption under each card's value. The value itself is a lifetime total; the
 * percentage next to it compares the last 7 days with the 7 days *before*
 * them, so the caption names that comparison period explicitly.
 *
 * The badge is hidden when there is nothing to show (no baseline, or no
 * change), so the caption says so instead of referring to a missing number.
 */
const trendCaption = (trend: number | null) => {
  if (trend === null) return "No activity in previous 7 days";
  if (trend === 0) return "No change vs previous 7 days";
  return "vs previous 7 days";
};

/**
 * The four headline cards. Values are lifetime totals. Trends come from the
 * API and compare the last 7 days with the 7 days before them.
 */
const DashboardStats = () => {
  const { stats, isLoading } = useDashboardStats();
  // Until the first response arrives every trend is unknown, so don't claim "no activity".
  const captionFor = (trend: number | null) =>
    isLoading ? "vs previous 7 days" : trendCaption(trend);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={<Navigation className="h-4 w-4" />}
        iconClass="bg-primary/10 text-primary"
        label="Applications"
        value={stats.total}
        trend={stats.trends.applications ?? undefined}
        caption={captionFor(stats.trends.applications)}
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        label="Interviews"
        value={stats.interviewCount}
        trend={stats.trends.interviews ?? undefined}
        caption={captionFor(stats.trends.interviews)}
      />
      <StatCard
        icon={<MessageSquare className="h-4 w-4" />}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        label="Responses"
        value={stats.responseCount}
        trend={stats.trends.responses ?? undefined}
        caption={captionFor(stats.trends.responses)}
      />
      <StatCard
        icon={<Target className="h-4 w-4" />}
        iconClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        label="Offer"
        value={stats.offerCount}
        trend={stats.trends.offers ?? undefined}
        caption={captionFor(stats.trends.offers)}
      />
    </div>
  );
};

export default DashboardStats;
