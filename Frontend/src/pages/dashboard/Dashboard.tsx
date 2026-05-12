import React from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";

import { DashboardPageSkeleton } from "@/pages/shared/skeletons";
import { DashboardStats, RecentApplications, UpcomingInterviews, ActivityChart, TipCard } from "@/components";

const normalize = (status?: string) =>
  (status ?? "").toLowerCase().trim();

const safeDate = (d: any) => {
  const date = new Date(d);
  return isNaN(date.getTime()) ? new Date() : date;
};

type ActivityKind = "offer" | "rejection" | "interview" | "application";

const activityTypeFromStatus = (status?: string): ActivityKind => {
  const s = normalize(status);
  if (s === "offer") return "offer";
  if (s === "rejected") return "rejection";
  if (s === "interviewing") return "interview";
  return "application";
};

const Dashboard: React.FC = () => {
  const { data: jobs = [], isLoading } = useJobs();

  /* ---------------- STATS ---------------- */
  const stats = React.useMemo(() => {
    let total = jobs.length;
    let inProgress = 0;
    let interviewed = 0;
    let offered = 0;
    let rejections = 0;

    for (const j of jobs) {
      const status = normalize(j.status);

      if (status === "applied") inProgress++;
      else if (status === "interviewing") interviewed++;
      else if (status === "offer") offered++;
      else if (status === "rejected") rejections++;
    }

    return { total, inProgress, interviewed, offered, rejections };
  }, [jobs]);

  /* ---------------- RECENT ACTIVITY ---------------- */
  const recentActivity = React.useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      )
      .slice(0, 5)
      .map((job) => ({
        id: String(job.id),
        type: activityTypeFromStatus(job.status),
        company: String(job.company ?? ""),
        position: String(job.title ?? ""),
        date: safeDate(job.applicationDate),
      }));
  }, [jobs]);

  /* ---------------- UPCOMING INTERVIEWS ---------------- */
  const upcomingInterviews = React.useMemo(() => {
    return jobs
      .flatMap((job) => {
        if (
          normalize(job.status) !== "interviewing" ||
          !Array.isArray(job.interviews)
        ) return [];

        return job.interviews.map((i: any) => {
          const date = safeDate(i?.date);

          return {
            id: job.id,
            company: job.company,
            position: job.title,
            date,
          };
        });
      })
      .filter((x: any) => x.date >= new Date())
      .sort((a: any, b: any) => a.date - b.date);
  }, [jobs]);

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Link to="/add-job">
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <DashboardStats stats={stats} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <RecentApplications data={recentActivity} />

        <UpcomingInterviews data={upcomingInterviews} />

        {/* Optional chart section */}
        <ActivityChart>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Briefcase />
            <span>Connect chart library (Recharts / Chart.js)</span>
          </div>
        </ActivityChart>

        <TipCard />
      </div>
    </div>
  );
};

export default Dashboard;