"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { useAnalyticsData, type Period } from "@/features/jobseeker/analytics/hooks/useAnalyticsData";
import { exportJobsAsCsv } from "@/features/jobseeker/analytics/utils/exportReport";

import ApplicationProgressDonut from "@/components/shared/Dashboard/ApplicationProgressDonut";
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

  const handleExport = () => {
    if (jobs.length === 0) {
      toast.info("No applications to export yet");
      return;
    }
    exportJobsAsCsv(jobs);
    toast.success("Report exported", { description: "Your CSV download has started." });
  };

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} onExport={handleExport} />

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Left / main column */}
        <div className="space-y-6 xl:col-span-3">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <SourceChart data={sourceData} />
            <SkillsMatchChart data={skillsData} />
            <RecentActivityFeed />
          </div>

          <RecentApplicationsTable rows={recentApplications} />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <TopJobRolesCard roles={topRoles} />
          <KeyInsightsCard insights={insights} />
        </div>
      </div>
    </div>
  );
};

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background p-6 transition-colors">
      <AnalyticsBody />
    </div>
  );
};

export default Analytics;
