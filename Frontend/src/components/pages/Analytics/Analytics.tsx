import { useJobs } from "@/hooks/JobContext";
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

const Analytics = () => {
  const { jobs } = useJobs();

  // Calculate key metrics
  const totalJobs = jobs.length;
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
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

  // Prepare data for charts
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: totalJobs > 0 ? ((count / totalJobs) * 100).toFixed(1) : "0",
  }));

  const companyData = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([company, count]) => ({ company, count }));

  const jobTypeData = jobs.reduce((acc, job) => {
    acc[job.jobType] = (acc[job.jobType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTypeChartData = Object.entries(jobTypeData).map(([type, count]) => ({
    type: type || "Not specified",
    count,
  }));

  const locationData = jobs.reduce((acc, job) => {
    acc[job.location] = (acc[job.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([location, count]) => ({
      location: location || "Not specified",
      count,
    }));

  // Timeline data - applications per month
  const timelineData = jobs.reduce((acc, job) => {
    if (job.applicationDate) {
      const date = new Date(job.applicationDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
    }
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Job Application Analytics
          </h1>
          <div className="text-sm text-gray-500">
            Total Applications: {totalJobs}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            icon={<Briefcase />}
            value={totalJobs}
            description="Job applications submitted"
          />
          <StatCard
            title="Interview Rate"
            icon={<TrendingUp />}
            value={`${interviewRate}%`}
            description="Applications to interviews"
          />
          <StatCard
            title="Offer Rate"
            icon={<Clock />}
            value={`${offerRate}%`}
            description="Applications to offers"
          />
          <StatCard
            title="Active Applications"
            icon={<CalendarDays />}
            value={statusCounts["applied"] || 0}
            description="Pending responses"
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="w-full dark:bg-gray-900">
          <TabsList className="h-auto grid grid-cols-3 w-full gap-2 bg-gray-200 dark:bg-gray-900 sm:grid-cols-4 ">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 dark:bg-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dark:bg-gray-900">
              {/* Application Status Pie Chart */}
              <Card className="bg-white shadow-sm dark:bg-gray-900">
                <CardHeader>
                  <CardTitle>Application Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, percentage }) =>
                          `${status} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Job Type Distribution */}
              <Card className="bg-white shadow-sm dark:bg-gray-900">
                <CardHeader>
                  <CardTitle>Job Type Distribution</CardTitle>
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

          <TabsContent value="companies" className="space-y-6">
            <Card className="bg-white shadow-sm dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top Companies Applied To
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCompanies} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" type="category"  />
                    <YAxis  type="number"  />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card className="bg-white shadow-sm dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Applications by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topLocations}>
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffd900ff" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="bg-white shadow-sm dark:bg-gray-900">
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
