"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useJobs } from "@/features/jobseeker/jobs/hooks/JobContext";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const RANGE_OPTIONS = [
  { label: "Last 4 weeks", weeks: 4 },
  { label: "Last 8 weeks", weeks: 8 },
  { label: "Last 12 weeks", weeks: 12 },
];

const ApplicationProgressChart = () => {
  const { jobs } = useJobs();
  const [weeks, setWeeks] = useState(4);

  const data = useMemo(() => {
    const now = new Date();
    const points: { label: string; total: number }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekEnd = new Date(now.getTime() - i * WEEK_MS);
      const label = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const total = jobs.filter((j) => {
        const d = new Date(j.applicationDate).getTime();
        return !isNaN(d) && d <= weekEnd.getTime();
      }).length;
      points.push({ label, total });
    }

    return points;
  }, [jobs, weeks]);

  const maxValue = Math.max(5, ...data.map((d) => d.total));

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Application Progress
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Track your journey from application to interview and beyond.
          </p>
        </div>

        <select
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          className="h-9 shrink-0 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.weeks} value={opt.weeks}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 h-[260px] w-full">
        {jobs.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No applications yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="applicationProgressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, maxValue]}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "var(--color-border)",
                  fontSize: 12,
                  background: "var(--color-card)",
                  color: "var(--color-foreground)",
                }}
                labelStyle={{ color: "var(--color-muted-foreground)" }}
                formatter={(value: number) => [value, "Applications"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#applicationProgressFill)"
                dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default ApplicationProgressChart;
