"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AdminPageHeader from "@/features/admin/shell/PageHeader";
import { AdminErrorState } from "@/features/admin/components/AdminListStates";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmployerGrowthChart,
  JobsOverTimeChart,
  JobStatusPieChart,
  TopLocationsChart,
  UserGrowthChart,
} from "@/features/admin/analytics/AdminAnalyticsCharts";
import { useAdminDashboard } from "@/features/admin/dashboard/useAdminDashboard";
import type { AdminAnalyticsPeriod } from "@/types/admin";

const PERIODS: { value: AdminAnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

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

export default function AdminAnalyticsView() {
  const { charts, chartsLoading, chartsError, period, setPeriod, reloadCharts } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Platform trends and reports."
        actions={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as AdminAnalyticsPeriod)}>
              <SelectTrigger size="sm" className="w-[150px]" aria-label="Select reporting period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={reloadCharts} disabled={chartsLoading}>
              <RefreshCw className={chartsLoading ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} aria-hidden />
              Refresh
            </Button>
          </div>
        }
      />

      {chartsError ? (
        <AdminErrorState message={chartsError} onRetry={reloadCharts} />
      ) : chartsLoading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <UserGrowthChart data={charts?.userGrowth ?? []} />
          <EmployerGrowthChart data={charts?.employerGrowth ?? []} />
          <JobsOverTimeChart data={charts?.jobsOverTime ?? []} />
          <JobStatusPieChart data={charts?.jobStatusDistribution ?? []} />
          <div className="lg:col-span-2">
            <TopLocationsChart data={charts?.topLocations ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
