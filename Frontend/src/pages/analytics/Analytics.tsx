import { AnalyticsHeader, CompaniesChart, LocationsChart, MetricsGrid, OverviewCharts, TimelineChart } from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  const { data, isLoading, error, refetch } = useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error ?? "No analytics data"}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, charts } = data;

  return (
    <div className="min-h-screen bg-background p-6 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsHeader totalJobs={metrics.totalJobs} />

        <MetricsGrid metrics={metrics} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewCharts
              statusData={charts.status}
              jobTypeData={charts.jobTypes}
            />
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <CompaniesChart data={charts.companies} />
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <LocationsChart data={charts.locations} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineChart timelineData={charts.timeline} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
