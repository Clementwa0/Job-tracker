"use client";

import { Suspense } from "react";
import {
  DashboardMood,
  DashboardStats,
  QuickActionsCard,
  DashboardSkeleton,
  TodayFocusCard,
  RecentApplicationsTable,
  ProfileCompletenessCard,
  TipCard,
  TopOpportunities,
  UpcomingInterviews,
} from "@/features/jobseeker/dashboard";

import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

const DashboardBody = () => (
  <div className="space-y-4">
    {/* ── Full-width anchors ───────────────────────────── */}
    <DashboardMood />
    <DashboardStats />

    {/* ── Row 1 · WIDE left / SMALL right ──────────────── */}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <TodayFocusCard />
      </div>
      <div className="lg:col-span-4">
        <UpcomingInterviews/>
      </div>
    </div>

    {/* ── Row 2 · SMALL left / WIDE right ──────────────── */}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <QuickActionsCard />
      </div>
      <div className="lg:col-span-8">
        <RecentApplicationsTable />
      </div>
    </div>

    {/* ── Row 3 · WIDE left / SMALL right ──────────────── */}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <TopOpportunities />
      </div>
      <div className="space-y-4 lg:col-span-4">
        <ProfileCompletenessCard />
        <TipCard />
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <JobProvider>
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardBody />
    </Suspense>
  </JobProvider>
);

export default Dashboard;