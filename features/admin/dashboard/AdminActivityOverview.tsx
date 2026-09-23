"use client";

import { JobStatusPieChart, UserGrowthChart } from "@/features/admin/analytics/AdminAnalyticsCharts";
import { AdminErrorState } from "@/features/admin/components/AdminListStates";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminAnalyticsCharts } from "@/types/admin";

interface AdminActivityOverviewProps {
  charts: AdminAnalyticsCharts | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function ChartSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[240px] w-full rounded-lg sm:h-[260px]" />
      </CardContent>
    </Card>
  );
}

export default function AdminActivityOverview({
  charts,
  loading,
  error,
  onRetry,
}: AdminActivityOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="min-w-0 lg:col-span-2">
        <UserGrowthChart data={charts?.userGrowth ?? []} />
      </div>
      <div className="min-w-0">
        <JobStatusPieChart data={charts?.jobStatusDistribution ?? []} />
      </div>
    </div>
  );
}
