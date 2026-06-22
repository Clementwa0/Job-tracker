import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase, Building2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminErrorState } from "@/components/admin/AdminListStates";
import {
  EmployerGrowthChart,
  JobStatusPieChart,
  JobsOverTimeChart,
  TopCategoriesChart,
  TopLocationsChart,
  UserGrowthChart,
} from "@/features/admin/analytics/AdminAnalyticsCharts";
import AdminPageHeader from "@/features/admin/shell/AdminPageHeader";
import StatCard from "@/features/admin/shell/StatCard";
import { adminService } from "@/services/adminService";
import type { AdminAnalyticsCharts, AdminAnalyticsOverview, AdminAnalyticsPeriod } from "@/types/admin";
import { getApiErrorMessage } from "@/lib/apiError";

const PERIOD_OPTIONS: { value: AdminAnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const period = (searchParams.get("period") as AdminAnalyticsPeriod) || "30d";
  const safePeriod = PERIOD_OPTIONS.some((p) => p.value === period) ? period : "30d";

  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [charts, setCharts] = useState<AdminAnalyticsCharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPeriod = useCallback(
    (p: AdminAnalyticsPeriod) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (p === "30d") next.delete("period");
          else next.set("period", p);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const reload = useCallback(async () => {
    try {
      setError(null);
      const [ov, ch] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getAnalyticsCharts(safePeriod),
      ]);
      setOverview(ov);
      setCharts(ch);
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      toast.error(msg);
    }
  }, [safePeriod]);

  const loadCharts = useCallback(async (p: AdminAnalyticsPeriod) => {
    setChartsLoading(true);
    try {
      const data = await adminService.getAnalyticsCharts(p);
      setCharts(data);
    } finally {
      setChartsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [ov, ch] = await Promise.all([
          adminService.getAnalyticsOverview(),
          adminService.getAnalyticsCharts(safePeriod),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setCharts(ch);
      } catch (err) {
        if (!cancelled) {
          const msg = getApiErrorMessage(err);
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    loadCharts(safePeriod).catch((err) => toast.error(getApiErrorMessage(err)));
  }, [safePeriod, loading, loadCharts]);

  const memoizedCharts = useMemo(() => charts, [charts]);

  const periodSelect = (
    <Select value={safePeriod} onValueChange={(v) => setPeriod(v as AdminAnalyticsPeriod)}>
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analytics" description="Growth and platform metrics" actions={periodSelect} />
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analytics" description="Growth and platform metrics" />
        <AdminErrorState message={error || "Failed to load analytics"} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Growth and platform metrics"
        actions={periodSelect}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total users"
              value={overview.totalUsers}
              trend={overview.trends.users.month}
              icon={Users}
              accent="blue"
            />
            <StatCard
              title="Employers"
              value={overview.totalEmployers}
              trend={overview.trends.employers.month}
              icon={Users}
              accent="violet"
            />
            <StatCard
              title="Companies"
              value={overview.totalCompanies}
              trend={overview.trends.companies.month}
              icon={Building2}
              accent="green"
            />
            <StatCard
              title="Job postings"
              value={overview.totalJobs}
              trend={overview.trends.jobs.month}
              icon={Briefcase}
              accent="amber"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Published" value={overview.publishedJobs} icon={Briefcase} accent="green" />
            <StatCard title="Pending review" value={overview.pendingJobs} icon={Briefcase} accent="amber" />
            <StatCard title="Draft" value={overview.draftJobs} icon={Briefcase} />
            <StatCard title="Closed" value={overview.closedJobs} icon={Briefcase} />
          </div>
        </TabsContent>

        <TabsContent value="charts" className="relative space-y-6">
          {chartsLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {memoizedCharts ? (
            <Suspense fallback={<AnalyticsSkeleton />}>
              <div className="grid gap-6 lg:grid-cols-2">
                <JobStatusPieChart data={memoizedCharts.jobStatusDistribution} />
                <JobsOverTimeChart data={memoizedCharts.jobsOverTime} />
                <UserGrowthChart data={memoizedCharts.userGrowth} />
                <EmployerGrowthChart data={memoizedCharts.employerGrowth} />
                <TopCategoriesChart data={memoizedCharts.topCategories} />
                <TopLocationsChart data={memoizedCharts.topLocations} />
              </div>
            </Suspense>
          ) : (
            <AnalyticsSkeleton />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
