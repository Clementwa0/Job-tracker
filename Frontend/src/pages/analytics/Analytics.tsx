import { AnalyticsHeader, CompaniesChart, LocationsChart, MetricsGrid, OverviewCharts, TimelineChart } from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs } from "@/hooks/JobContext";
import { getMetrics, getStatusData, getTopCompanies, getJobTypeData, getTopLocations } from "@/utils/analyticsHelpers";



const Analytics = () => {
  const { jobs } = useJobs();

  const metrics = getMetrics(jobs);

  const statusData = getStatusData(jobs);
  const topCompanies = getTopCompanies(jobs);
  const jobTypeData = getJobTypeData(jobs);
  const topLocations = getTopLocations(jobs);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsHeader totalJobs={metrics.totalJobs} />

        <MetricsGrid metrics={metrics} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList
            className="
              grid grid-cols-2 md:grid-cols-4
              w-full h-auto gap-2
              bg-slate-200 dark:bg-slate-900
            "
          >
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewCharts
              statusData={statusData}
              jobTypeData={jobTypeData}
            />
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <CompaniesChart data={topCompanies} />
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <LocationsChart data={topLocations} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineChart />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;