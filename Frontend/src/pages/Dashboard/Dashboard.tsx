import { Suspense } from "react";
import {
  DashboardMood,
  DashboardStats,
  RecentApplications,
  UpcomingInterviews,
  TipCard,
  DashboardSkeleton,
} from "@/features/dashboard";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <div className="max-w-7xl mx-auto  md:p- space-y-6">

        {/* Top Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your applications and upcoming interviews.
            </p>
          </div>

          <Button asChild size="sm">
            <Link to="/applications/add">
              <Plus className="h-4 w-4 mr-1" />
              Add Job
            </Link>
          </Button>
        </div>

        {/* Mood Section */}
        <DashboardMood />

        {/* Stats */}
        <DashboardStats />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-4">
            <RecentApplications />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <UpcomingInterviews />
            <TipCard />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Dashboard;