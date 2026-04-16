import { useJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  CalendarDays,
  Briefcase,
  Clock,
  TrendingUp,
  MapPin,
  Building,
} from "lucide-react";
import StatCard from "./StatCard";
import { AnalyticsPageSkeleton } from "@/components/shared/skeletons";

const normalize = (v?: string) => (v ?? "").toLowerCase().trim();

const safeDate = (d: any) => {
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

const Analytics = () => {
  const { data: jobs = [], isLoading } = useJobs();

  if (isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  const totalJobs = jobs.length;

  // ---------------- STATUS COUNT ----------------
  const statusCounts = jobs.reduce((acc, job) => {
    const status = normalize(job.status);
    if (!status) return acc;

    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const interviewRate =
    totalJobs > 0
      ? (((statusCounts["interviewing"] || 0) / totalJobs) * 100).toFixed(1)
      : "0";

  const offerRate =
    totalJobs > 0
      ? (((statusCounts["offer"] || 0) / totalJobs) * 100).toFixed(1)
      : "0";

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage:
      totalJobs > 0 ? ((count / totalJobs) * 100).toFixed(1) : "0",
  }));

  // ---------------- COMPANIES ----------------
  const companyData = jobs.reduce((acc, job) => {
    const company = job.company || "Unknown";
    acc[company] = (acc[company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([company, count]) => ({ company, count }));

  // ---------------- JOB TYPES ----------------
  const jobTypeData = jobs.reduce((acc, job) => {
    const type = job.jobType || "Not specified";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTypeChartData = Object.entries(jobTypeData).map(([type, count]) => ({
    type,
    count,
  }));

  // ---------------- LOCATIONS ----------------
  const locationData = jobs.reduce((acc, job) => {
    const location = job.location || "Unknown";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([location, count]) => ({ location, count }));

  // ---------------- TIMELINE ----------------
  const timelineData = jobs.reduce((acc, job) => {
    const date = safeDate(job.applicationDate);
    if (!date) return acc;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineChartData = Object.entries(timelineData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      applications: count,
    }));

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#8DD1E1",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Job Application Analytics
          </h1>
          <div className="text-sm text-gray-500">
            Total Applications: {totalJobs}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Applications" icon={<Briefcase />} value={totalJobs} description="Total number of job applications" />
          <StatCard title="Interview Rate" icon={<TrendingUp />} value={`${interviewRate}%`} description="Percentage of applications that progressed to interviews" />
          <StatCard title="Offer Rate" icon={<Clock />} value={`${offerRate}%`} description="Percentage of applications that resulted in job offers" />
          <StatCard title="Active" icon={<CalendarDays />} value={statusCounts["applied"] || 0} description="Number of active job applications" />
        </div>

        {/* CHARTS */}
        <Tabs defaultValue="overview" className="w-full">

          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* PIE + JOB TYPE */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="count"
                        label={({ status, percentage }) =>
                          `${status} (${percentage}%)`
                        }
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={jobTypeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* COMPANIES */}
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <Building /> Top Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LOCATIONS */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                  <MapPin /> Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topLocations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TIMELINE */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={timelineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;