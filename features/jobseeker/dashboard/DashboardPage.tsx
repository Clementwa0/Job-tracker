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

import { JobProvider, useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";
import { Button } from "@/components/ui/button";

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <section aria-label={label} className="space-y-4">
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>

      <span className="h-px flex-1 bg-border" />
    </div>

    {children}
  </section>
);

/** Shown when applications could not be loaded, so empty cards aren't mistaken for "no data". */
const LoadError = () => {
  const { error, refetchJobs } = useJobs();
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-destructive">
        We couldn&apos;t load your applications ({error}). The numbers below may be incomplete.
      </p>
      <Button variant="outline" size="sm" className="h-7 self-start text-xs sm:self-auto" onClick={() => void refetchJobs()}>
        Try again
      </Button>
    </div>
  );
};

const DashboardBody = () => {
  return (
    <>
      <main
        className="
          mx-auto
          max-w-[1400px]
          space-y-8
          pb-24
          sm:space-y-10
          lg:pb-5
        "
      >
        <LoadError />

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
