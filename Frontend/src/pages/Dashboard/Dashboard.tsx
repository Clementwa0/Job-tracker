import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  DashboardMood,
  DashboardStats,
  RecentApplications,
  TipCard,
  UpcomingInterviews,
} from "@/components";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your job search progress and stay organized.
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            <Link to="/add-job">Add New Job</Link>
          </Button>
        </header>

        {/* MOOD */}
        <DashboardMood />

        {/* STATS */}
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground">
              Your job search performance at a glance.
            </p>
          </div>
          <DashboardStats />
        </section>

        {/* MAIN GRID */}
        <div className="grid gap-2 lg:grid-cols-3">
          {/* LEFT - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest job activity updates</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentApplications />
            </CardContent>
          </Card>

          {/* RIGHT SIDEBAR - Takes 1 column */}
          <div className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>
                  Don't miss your scheduled interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingInterviews />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tip of the Day</CardTitle>
                <CardDescription>Improve your job search strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <TipCard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;