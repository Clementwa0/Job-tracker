import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMood, DashboardStats, RecentApplications, TipCard, UpcomingInterviews } from "@/components";


const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-4 space-y-6 bg-white dark:bg-gray-900 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>

        <Link to="/add-job">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </Link>
      </div>

    <DashboardMood/>
      {/* Stats */}
      <DashboardStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left */}
        <RecentApplications />

        {/* Right */}
        <div className="space-y-6">
          <UpcomingInterviews />
          <TipCard />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;