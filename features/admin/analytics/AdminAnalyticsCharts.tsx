"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAnalyticsCharts } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  published: "var(--chart-1)",
  pending_review: "var(--chart-2)",
  draft: "var(--chart-3)",
  closed: "var(--chart-4)",
};

const FALLBACK_COLOR = "var(--chart-5)";

/** Shared recharts presentation so every admin chart reads the same. */
const AXIS = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "var(--muted-foreground)" },
} as const;

const GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--border)",
} as const;

const TOOLTIP = {
  contentStyle: {
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "0.625rem",
    fontSize: 12,
    boxShadow: "none",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11 },
  itemStyle: { color: "var(--popover-foreground)", fontSize: 12 },
} as const;

/** Uniform chart height keeps the dashboard rows aligned on every breakpoint. */
const CHART_HEIGHT = "h-[240px] sm:h-[260px]";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div
      className={`flex ${CHART_HEIGHT} flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center`}
    >
      <BarChart3 className="size-6 text-muted-foreground/60" />
      <p className="px-6 text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function hasSeriesData(data: { count: number }[]) {
  return data.length > 0 && data.some((d) => d.count > 0);
}

export const JobStatusPieChart = memo(({ data }: { data: AdminAnalyticsCharts["jobStatusDistribution"] }) => {
  const chartData = useMemo(() => data.filter((d) => d.value > 0), [data]);
  const total = useMemo(() => chartData.reduce((sum, d) => sum + d.value, 0), [chartData]);

  if (chartData.length === 0) {
    return (
      <ChartCard title="Job status distribution">
        <ChartEmpty message="No job postings in this period yet." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Job status distribution" subtitle={`${total.toLocaleString()} job postings`}>
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || FALLBACK_COLOR} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {chartData.map((entry) => (
          <li key={entry.status} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: STATUS_COLORS[entry.status] || FALLBACK_COLOR }}
            />
            <span className="truncate text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums">{entry.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
});
JobStatusPieChart.displayName = "JobStatusPieChart";

export const JobsOverTimeChart = memo(({ data }: { data: AdminAnalyticsCharts["jobsOverTime"] }) => {
  if (!hasSeriesData(data)) {
    return (
      <ChartCard title="Jobs posted over time">
        <ChartEmpty message="No jobs were posted in this period." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Jobs posted over time" subtitle="Job postings created per day">
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="date" {...AXIS} minTickGap={24} />
            <YAxis allowDecimals={false} width={36} {...AXIS} />
            <Tooltip {...TOOLTIP} />
            <Line
              type="monotone"
              dataKey="count"
              name="Jobs posted"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
});
JobsOverTimeChart.displayName = "JobsOverTimeChart";

interface GrowthChartProps {
  data: AdminAnalyticsCharts["userGrowth"];
  action?: React.ReactNode;
}

export const UserGrowthChart = memo(({ data, action }: GrowthChartProps) => {
  if (!hasSeriesData(data)) {
    return (
      <ChartCard title="User growth" action={action}>
        <ChartEmpty message="No new user sign-ups in this period." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="User growth" subtitle="New accounts per period" action={action}>
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adminUserGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="period" {...AXIS} minTickGap={24} />
            <YAxis allowDecimals={false} width={36} {...AXIS} />
            <Tooltip {...TOOLTIP} />
            <Area
              type="monotone"
              dataKey="count"
              name="New users"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#adminUserGrowthFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
});
UserGrowthChart.displayName = "UserGrowthChart";

export const EmployerGrowthChart = memo(({ data }: { data: AdminAnalyticsCharts["employerGrowth"] }) => {
  if (!hasSeriesData(data)) {
    return (
      <ChartCard title="Employer growth">
        <ChartEmpty message="No new employer accounts in this period." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Employer growth" subtitle="New employer accounts per period">
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="period" {...AXIS} minTickGap={16} />
            <YAxis allowDecimals={false} width={36} {...AXIS} />
            <Tooltip {...TOOLTIP} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar
              dataKey="count"
              name="New employers"
              fill="var(--chart-3)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
});
EmployerGrowthChart.displayName = "EmployerGrowthChart";

export const TopCategoriesChart = memo(({ data }: { data: AdminAnalyticsCharts["topCategories"] }) => {
  if (!hasSeriesData(data)) {
    return (
      <ChartCard title="Top job categories">
        <ChartEmpty message="No categories to show — job postings have no tags yet." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Top job categories" subtitle="From job tags">
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...AXIS} />
            <YAxis type="category" dataKey="name" width={110} {...AXIS} />
            <Tooltip {...TOOLTIP} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar
              dataKey="count"
              name="Jobs"
              fill="var(--chart-4)"
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
});
TopCategoriesChart.displayName = "TopCategoriesChart";

export const TopLocationsChart = memo(({ data }: { data: AdminAnalyticsCharts["topLocations"] }) => {
  if (!hasSeriesData(data)) {
    return (
      <ChartCard title="Top hiring locations">
        <ChartEmpty message="No locations to show for this period." />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Top hiring locations" subtitle="Job postings by location">
      <div className={`${CHART_HEIGHT} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID} horizontal={false} />
            <XAxis type="number" allowDecimals={false} {...AXIS} />
            <YAxis type="category" dataKey="name" width={110} {...AXIS} />
            <Tooltip {...TOOLTIP} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar
              dataKey="count"
              name="Jobs"
              fill="var(--chart-5)"
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
});
TopLocationsChart.displayName = "TopLocationsChart";
