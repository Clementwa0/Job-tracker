import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobs } from "@/hooks/JobContext";

export const description = "An interactive pie chart";

type JobStatusKey = "applied" | "interviewing" | "offer" | "rejected";

const chartConfig: Record<JobStatusKey, { label: string; color: string }> = {
  applied: {
    label: "Applied",
    color: "var(--chart-1)",
  },
  interviewing: {
    label: "Interviewing",
    color: "var(--chart-2)",
  },
  offer: {
    label: "Offer",
    color: "var(--chart-3)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const Charts = () => {
  const id = "pie-interactive";
  const { jobs } = useJobs();

  const jobStatus: { status: JobStatusKey; count: number; fill: string }[] =
    React.useMemo(() => {
      const applied = jobs.filter(
        (j) => j.status?.toLowerCase() === "applied"
      ).length;
      const interviewing = jobs.filter(
        (j) => j.status?.toLowerCase() === "interviewing"
      ).length;
      const offer = jobs.filter(
        (j) => j.status?.toLowerCase() === "offer"
      ).length;
      const rejected = jobs.filter(
        (j) => j.status?.toLowerCase() === "rejected"
      ).length;

      return [
        { status: "applied", count: applied, fill: chartConfig.applied.color },
        {
          status: "interviewing",
          count: interviewing,
          fill: chartConfig.interviewing.color,
        },
        { status: "offer", count: offer, fill: chartConfig.offer.color },
        {
          status: "rejected",
          count: rejected,
          fill: chartConfig.rejected.color,
        },
      ];
    }, [jobs]);

const [activeStatus, setActiveStatus] = React.useState<JobStatusKey>("applied");
  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardContent>No job data available.</CardContent>
      </Card>
    );
  }

  const activeIndex = React.useMemo(
    () => jobStatus.findIndex((item) => item.status === activeStatus),
    [activeStatus]
  );
  const status = React.useMemo(() => jobStatus.map((item) => item.status), []);

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Pie Chart - Interactive</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </div>
        <Select
          value={activeStatus}
          onValueChange={(value) => setActiveStatus(value as JobStatusKey)}
        >
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {status.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={jobStatus}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {jobStatus[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className=""
                        >
                          {chartConfig[jobStatus[activeIndex].status].label}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default Charts;
