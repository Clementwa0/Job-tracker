"use client";

import { Briefcase, Building2, ClipboardCheck, Eye, UserRound, Users } from "lucide-react";
import { KpiCard } from "@/features/admin/analytics/KpiCard";
import { AdminErrorState } from "@/features/admin/components/AdminListStates";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminAnalytics, AdminAnalyticsOverview } from "@/types/admin";

interface AdminStatsGridProps {
  overview: AdminAnalyticsOverview | null;
  analytics: AdminAnalytics | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";

function StatsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} size="sm" className="h-full gap-2">
          <CardContent className="flex items-start justify-between gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-7 rounded-lg" />
          </CardContent>
          <CardContent>
            <Skeleton className="h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminStatsGrid({
  overview,
  analytics,
  loading,
  error,
  onRetry,
}: AdminStatsGridProps) {
  if (loading) return <StatsSkeleton />;
  if (error) return <AdminErrorState message={error} onRetry={onRetry} />;

  const jobSeekers = analytics?.users.byRole?.user;
  const cards: React.ComponentProps<typeof KpiCard>[] = [];

  if (overview) {
    cards.push(
      { label: "Total users", value: overview.totalUsers, trends: overview.trends.users, icon: Users },
      ...(jobSeekers === undefined
        ? []
        : [{ label: "Job seekers", value: jobSeekers, hint: "Accounts with the job seeker role", icon: UserRound }]),
      { label: "Employers", value: overview.totalEmployers, trends: overview.trends.employers, icon: Building2 },
      { label: "Active jobs", value: overview.publishedJobs, hint: `${overview.totalJobs.toLocaleString()} total postings`, icon: Briefcase },
      {
        label: "Pending review",
        value: overview.pendingJobs,
        hint: overview.pendingJobs > 0 ? "Awaiting moderation" : "Nothing in the queue",
        icon: ClipboardCheck,
      },
    );
  } else if (analytics) {
    // Overview endpoint unavailable - fall back to the wider analytics payload.
    cards.push(
      { label: "Total users", value: analytics.users.total, hint: "All registered accounts", icon: Users },
      ...(jobSeekers === undefined
        ? []
        : [{ label: "Job seekers", value: jobSeekers, hint: "Accounts with the job seeker role", icon: UserRound }]),
      { label: "Companies", value: analytics.companies.total, hint: "Employer organisations", icon: Building2 },
      { label: "Job postings", value: analytics.jobPostings.total, hint: "All statuses", icon: Briefcase },
      { label: "Job views", value: analytics.jobPostings.totalViews, hint: "Across all postings", icon: Eye },
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium">Platform statistics unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No analytics data has been returned for this platform yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={GRID}>
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
