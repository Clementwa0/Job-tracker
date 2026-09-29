"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useAnalyticsData, type Period } from "@/features/jobseeker/analytics/hooks/useAnalyticsData";
import { exportJobsAsCsv } from "@/features/jobseeker/analytics/utils/exportReport";

import ApplicationProgressDonut from "@/components/shared/dashboard/ApplicationProgressDonut";
import RecentActivityFeed from "@/features/jobseeker/dashboard/components/RecentActivityFeed";

import {
  AnalyticsHeader,
  AnalyticsSkeleton,
  MetricsGrid,
  RecentApplicationsTable,
  TopJobRolesCard,
  KeyInsightsCard,
  ApplicationProgressChart,
  SourceChart,
  SkillsMatchChart,
} from "./components";

const AnalyticsBody = () => {
  const [period, setPeriod] = useState<Period>("30d");
  const { jobs } = useJobs();
  const {
    metrics,
    outcomeSlices,
    progressSeries,
    sourceData,
    skillsData,
    topRoles,
    recentApplications,
    insights,
    isLoading,
  } = useAnalyticsData(period);

  const handleExport = useCallback(() => {
    if (jobs.length === 0) {
      toast.info("No applications to export yet");
      return;
    }
    exportJobsAsCsv(jobs);
    toast.success("Report exported", { description: "Your CSV download has started." });
  }, [jobs]);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} onExport={handleExport} />

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
        {/* Main column */}
        <div className="space-y-4 sm:space-y-6 xl:col-span-3">
          {/* Progress + Outcomes */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ApplicationProgressChart data={progressSeries} />
            </div>
            <ApplicationProgressDonut
              total={jobs.length}
              slices={outcomeSlices}
              title="Application Outcomes"
              showViewAll={false}
            />
          </div>

          {/* Sources + Skills + Activity */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
            <SourceChart data={sourceData} />
            <SkillsMatchChart data={skillsData} />
            <RecentActivityFeed />
          </div>

          {/* Recent applications */}
          <RecentApplicationsTable rows={recentApplications} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <TopJobRolesCard roles={topRoles} />
          <KeyInsightsCard insights={insights} />
        </div>
      </div>
    </div>
  );
};

const Analytics = () => (
  <div className="min-h-screen bg-background p-4 transition-colors sm:p-6">
    <AnalyticsBody />
  </div>
);

export default Analytics;