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
import AdminPageHeader from "@/features/admin/shell/PageHeader";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import AdminActivityOverview from "./AdminActivityOverview";
import AdminAttentionPanel from "./AdminAttentionPanel";
import AdminQuickActions from "./AdminQuickActions";
import AdminRecentActivity from "./AdminRecentActivity";
import AdminStatsGrid from "./AdminStatsGrid";
import { useAdminDashboard } from "./useAdminDashboard";
import type { AdminAnalyticsPeriod } from "@/types/admin";

const PERIODS: { value: AdminAnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

function SectionHeading({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-heading text-sm font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}

export default function AdminDashboardView() {
  const { user } = useAuth();
  const {
    overview,
    analytics,
    summaryLoading,
    summaryError,
    charts,
    chartsLoading,
    chartsError,
    period,
    setPeriod,
    reloadSummary,
    reloadCharts,
    refreshAll,
  } = useAdminDashboard();

  const busy = summaryLoading || chartsLoading;
  const firstName = user?.name?.trim().split(" ")[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Welcome back, ${firstName || "Admin"}`}
        description="Here's an overview of your JobTrail platform."
        actions={
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={busy}>
            <RefreshCw className={busy ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} aria-hidden />
            Refresh
          </Button>
        }
      />

      <section className="space-y-3">
        <SectionHeading title="Platform statistics" />
        <AdminStatsGrid
          overview={overview}
          analytics={analytics}
          loading={summaryLoading}
          error={summaryError}
          onRetry={reloadSummary}
        />
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Activity overview"
          action={
            <Select value={period} onValueChange={(value) => setPeriod(value as AdminAnalyticsPeriod)}>
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
          }
        />
        <AdminActivityOverview
          charts={charts}
          loading={chartsLoading}
          error={chartsError}
          onRetry={reloadCharts}
        />
      </section>

      <section className="space-y-3">
        <SectionHeading title="Recent activity" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <AdminRecentActivity
              logs={analytics?.recentAuditLogs ?? null}
              loading={summaryLoading}
              unavailable={!summaryLoading && !analytics}
            />
          </div>
          <div className="min-w-0">
            <AdminAttentionPanel overview={overview} analytics={analytics} loading={summaryLoading} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Quick actions" />
        <AdminQuickActions />
      </section>
    </div>
  );
}
