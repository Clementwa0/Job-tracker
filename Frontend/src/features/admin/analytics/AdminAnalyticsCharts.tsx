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
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AdminAnalyticsCharts } from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  published: "hsl(var(--chart-1))",
  pending_review: "hsl(var(--chart-2))",
  draft: "hsl(var(--chart-3))",
  closed: "hsl(var(--chart-4))",
};

const jobStatusConfig: ChartConfig = {
  Published: { label: "Published", color: "hsl(var(--chart-1))" },
  Pending: { label: "Pending", color: "hsl(var(--chart-2))" },
  Draft: { label: "Draft", color: "hsl(var(--chart-3))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-4))" },
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export const JobStatusPieChart = memo(({ data }: { data: AdminAnalyticsCharts["jobStatusDistribution"] }) => {
  const chartData = useMemo(
    () => data.filter((d) => d.value > 0),
    [data],
  );

  if (chartData.length === 0) {
    return (
      <ChartCard title="Job status distribution">
        <p className="py-12 text-center text-sm text-muted-foreground">No job data for this period</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Job status distribution" subtitle="Published · Pending · Draft · Closed">
      <ChartContainer config={jobStatusConfig} className="mx-auto aspect-square max-h-[300px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || CHART_COLORS[0]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
        </PieChart>
      </ChartContainer>
    </ChartCard>
  );
});
JobStatusPieChart.displayName = "JobStatusPieChart";

export const JobsOverTimeChart = memo(({ data }: { data: AdminAnalyticsCharts["jobsOverTime"] }) => {
  const chartConfig: ChartConfig = {
    count: { label: "Jobs posted", color: "hsl(var(--chart-1))" },
  };

  return (
    <ChartCard title="Jobs posted over time">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
});
JobsOverTimeChart.displayName = "JobsOverTimeChart";

export const UserGrowthChart = memo(({ data }: { data: AdminAnalyticsCharts["userGrowth"] }) => {
  const chartConfig: ChartConfig = {
    count: { label: "New users", color: "hsl(var(--chart-2))" },
  };

  return (
    <ChartCard title="User growth">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-count)"
            fill="url(#userGrowthFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
});
UserGrowthChart.displayName = "UserGrowthChart";

export const EmployerGrowthChart = memo(({ data }: { data: AdminAnalyticsCharts["employerGrowth"] }) => {
  const chartConfig: ChartConfig = {
    count: { label: "New employers", color: "hsl(var(--chart-3))" },
  };

  return (
    <ChartCard title="Employer growth">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
});
EmployerGrowthChart.displayName = "EmployerGrowthChart";

export const TopCategoriesChart = memo(({ data }: { data: AdminAnalyticsCharts["topCategories"] }) => {
  const chartConfig: ChartConfig = {
    count: { label: "Jobs", color: "hsl(var(--chart-4))" },
  };

  return (
    <ChartCard title="Top job categories" subtitle="From job tags">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
});
TopCategoriesChart.displayName = "TopCategoriesChart";

export const TopLocationsChart = memo(({ data }: { data: AdminAnalyticsCharts["topLocations"] }) => {
  const chartConfig: ChartConfig = {
    count: { label: "Jobs", color: "hsl(var(--chart-5))" },
  };

  return (
    <ChartCard title="Top hiring locations">
      <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
});
TopLocationsChart.displayName = "TopLocationsChart";
