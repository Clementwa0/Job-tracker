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
import { Card} from "@/components/ui/card";
import { useJobs } from "@/hooks/JobContext";
import { Stat } from "./statsCard";
import TipCard from "./TipCard";
import { DashboardPageSkeleton } from "@/components/shared/skeletons";

const Dashboard: React.FC = () => {
  const { jobs, isLoading } = useJobs();

  const stats = React.useMemo(() => {
    const total = jobs.length;
    const inProgress = jobs.filter(
      (j) => j.status?.toLowerCase() === "applied"
    ).length;
    const interviewed = jobs.filter(
      (j) => j.status?.toLowerCase() === "interviewing"
    ).length;
    const offered = jobs.filter(
      (j) => j.status?.toLowerCase() === "offer"
    ).length;
    const rejections = jobs.filter(
      (j) => j.status?.toLowerCase() === "rejected"
    ).length;
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
          job.status === "offered"
            ? "offer"
            : job.status === "rejected"
            ? "rejection"
            : job.status === "interviewed"
            ? "interview"
            : "application",
        company: job.company,
        position: job.title,
        date: new Date(job.applicationDate),
      }));
  }, [jobs]);

  const upcomingInterviews = React.useMemo(() => {
    return jobs
      .filter(
        (job) =>
          job.status?.toLowerCase() === "interviewing" &&
          Array.isArray(job.interviews) &&
          job.interviews.length > 0
      )
      .map((job) => {
        const firstInterview = job.interviews[0];
        const dateStr = typeof firstInterview === "object" && firstInterview !== null && "date" in firstInterview
          ? (firstInterview as { date: string }).date
          : String(firstInterview);
        return { job, dateStr };
      })
      .filter(({ dateStr }) => new Date(dateStr) >= new Date())
      .sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime())
      .map(({ job, dateStr }) => ({
        id: job.id,
        company: job.company,
        position: job.title,
        date: new Date(dateStr),
      }));
  }, [jobs]);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <Link to="/add-job">
          <Button className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50 dark:bg-gray-900">
          <Stat
            icon={
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            }
            label="Total Applications"
            value={stats.total}
            color="blue"
          />
        </Card>
        <Card className="p-6 bg-amber-50 dark:bg-gray-900">
          <Stat
            icon={
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
            }
            label="In Progress"
            value={stats.inProgress}
            color="amber"
          />
        </Card>
        <Card className="p-6 bg-purple-50 dark:bg-gray-900">
          <Stat
            icon={
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            }
            label="Interviews"
            value={stats.interviewed}
            color="purple"
          />
        </Card>
        <Card className="p-6 bg-green-50 dark:bg-gray-900">
          <Stat
            icon={
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-300" />
            }
            label="Offers"
            value={stats.offered}
            color="green"
          />
        </Card>
        <Card className="p-6 bg-red-50 dark:bg-gray-900">
          <Stat
            icon={
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
            }
            label="Rejections"
            value={stats.rejections}
            color="red"
          />
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 gap-8">
        {/* Left - Activity & Chart */}
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  No recent activity.
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900">
                      {activity.type === "application" && (
                        <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      )}
                      {activity.type === "interviewed" && (
                        <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                      )}
                      {activity.type === "offered" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300" />
                      )}
                      {activity.type === "rejection" && (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {activity.position}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.company}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {activity.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

         
        </div>

        {/* Right side — future widgets */}
        <div className="space-y-6">
           {/* <Card className="p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Application Status
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600"
              >
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                <p>Application status chart will be displayed here</p>
              </div>
            </div>
          </Card> */}
          <Card className="p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Upcoming Interviews
            </h2>
            <div className="space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">
                  No upcoming interviews.
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-900">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {interview.position}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {interview.company}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {interview.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

            <TipCard/>
        </div>
      </div>
    </div>
  );
};



export default Dashboard;


