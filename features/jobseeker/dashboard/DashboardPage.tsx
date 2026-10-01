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
  SavedJobsCard,
} from "@/features/jobseeker/dashboard";

import { JobProvider } from "@/features/jobseeker/jobs/hooks/JobContext";

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>

      <span className="h-px flex-1 bg-border" />
    </div>

    {children}
  </section>
);

const DashboardBody = () => {
  return (
    <>
      <main
        className="
          mx-auto
          max-w-[1400px]
          space-y-10
          px-2
          py-2
          pb-24
          md:px-2
          lg:px-2
          lg:pb-5
        "
      >
        <DashboardMood />

        {/* ACT NOW */}
        <Section label="Act now">
          <div className="space-y-4">
            <DashboardStats />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
              <TodayFocusCard />
            </div>

            <div className="min-w-0 lg:col-span-5 xl:col-span-4">
              <UpcomingInterviews />
            </div>
          </div>
        </Section>

        {/* IN FLIGHT */}
        <Section label="In flight">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <RecentApplicationsTable />
            </div>

            <div className="min-w-0 lg:col-span-4">
              <SavedJobsCard />
            </div>
          </div>
        </Section>

        {/* EXPLORE */}
        <Section label="Explore">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="min-w-0 lg:col-span-8">
              <TopOpportunities />
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:col-span-4
                lg:grid-cols-1
              "
            >
              <ProfileCompletenessCard />
              <TipCard />
            </div>
          </div>
        </Section>
      </main>

      {/* FLOATING QUICK ACTION */}
      <QuickActionsCard />
    </>
  );
};

const Dashboard = () => {
  return (
    <JobProvider>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBody />
      </Suspense>
    </JobProvider>
  );
};

export default Dashboard;
