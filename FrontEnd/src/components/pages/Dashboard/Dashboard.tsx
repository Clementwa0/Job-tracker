import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Plus,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/hooks/useJobs";
import { Stat } from "./statsCard";
import TipCard from "./TipCard";
import { DashboardPageSkeleton } from "@/components/shared/skeletons";

const normalize = (status?: string) =>
  (status ?? "").toLowerCase().trim();

const safeDate = (d: any) => {
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

const Dashboard: React.FC = () => {
  const { data: jobs = [], isLoading } = useJobs();

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

  const recentActivity = React.useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.applicationDate).getTime() -
          new Date(a.applicationDate).getTime()
      )
      .slice(0, 5)
      .map((job) => ({
        id: job.id,
        type:
          normalize(job.status) === "offer"
            ? "offer"
            : normalize(job.status) === "rejected"
            ? "rejection"
            : normalize(job.status) === "interviewing"
            ? "interview"
            : "application",
        company: job.company,
        position: job.title,
        date: safeDate(job.applicationDate) ?? new Date(),
      }));
  }, [jobs]);

  const upcomingInterviews = React.useMemo(() => {
    return jobs
      .flatMap((job) => {
        if (
          normalize(job.status) !== "interviewing" ||
          !Array.isArray(job.interviews)
        ) {
          return [];
        }

        return job.interviews.map((i: any) => {
          const date = safeDate(i?.date);
          if (!date) return null;

          return {
            id: job.id,
            company: job.company,
            position: job.title,
            date,
          };
        });
      })
      .filter(Boolean)
      .filter((x: any) => x.date >= new Date())
      .sort((a: any, b: any) => a.date - b.date);
  }, [jobs]);

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <Link to="/add-job">
          <Button variant="secondary" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50 dark:bg-gray-900">
          <Stat icon={<Briefcase />} label="Total" value={stats.total} color="blue" />
        </Card>

        <Card className="p-6 bg-amber-50 dark:bg-gray-900">
          <Stat icon={<Clock />} label="Applied" value={stats.inProgress} color="amber" />
        </Card>

        <Card className="p-6 bg-purple-50 dark:bg-gray-900">
          <Stat icon={<Calendar />} label="Interviews" value={stats.interviewed} color="purple" />
        </Card>

        <Card className="p-6 bg-green-50 dark:bg-gray-900">
          <Stat icon={<CheckCircle2 />} label="Offers" value={stats.offered} color="green" />
        </Card>

        <Card className="p-6 bg-red-50 dark:bg-gray-900">
          <Stat icon={<XCircle />} label="Rejected" value={stats.rejections} color="red" />
        </Card>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* RECENT */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity.</p>
          ) : (
            recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3">
                <div>
                  {a.type === "offer" && <CheckCircle2 />}
                  {a.type === "rejection" && <XCircle />}
                  {a.type === "interview" && <Calendar />}
                  {a.type === "application" && <Briefcase />}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{a.position}</p>
                  <p className="text-sm text-gray-500">{a.company}</p>
                </div>

                <span className="text-sm text-gray-400">
                  {a.date.toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </Card>

        {/* INTERVIEWS */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Upcoming Interviews
          </h2>

          {upcomingInterviews.length === 0 ? (
            <p className="text-gray-500">No upcoming interviews.</p>
          ) : (
            upcomingInterviews.map((i: any) => (
              <div key={`${i.id}-${i.date}`} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 mb-3">
                <Calendar className="text-purple-500" />

                <div className="flex-1">
                  <p className="font-medium">{i.position}</p>
                  <p className="text-sm text-gray-500">{i.company}</p>
                </div>

                <span className="text-sm text-gray-400">
                  {i.date.toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </Card>

        <TipCard />
      </div>
    </div>
  );
};

export default Dashboard;