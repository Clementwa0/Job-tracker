import { Card } from "@/components/ui/card";
import { useJobs } from "@/hooks/JobContext";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const WeeklyChart = () => {
  const { jobs } = useJobs();

  const data = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));

      const key = d.toISOString().slice(0, 10);

      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        key,
        applications: 0,
      };
    });

    jobs.forEach((j) => {
      const date = j.applicationDate
        ? new Date(j.applicationDate)
        : null;

      if (!date || Number.isNaN(date.getTime())) return;

      const k = date.toISOString().slice(0, 10);
      const slot = days.find((d) => d.key === k);

      if (slot) slot.applications += 1;
    });

    return days;
  }, [jobs]);

  return (
    <Card
      className="
        p-5
        border
        border-slate-200
        dark:border-slate-800
        bg-white/80
        dark:bg-slate-900/70
        backdrop-blur-xl
        shadow-sm
        dark:shadow-none
        transition-colors
      "
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            This Week
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Applications per day
          </p>
        </div>

        <div
          className="
            px-2 py-1 rounded-md text-xs font-medium
            bg-slate-800 text-slate-700
            dark:bg-slate-900 dark:text-slate-300
          "
        >
          Last 7 Days
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="#0ea5e9"
                  stopOpacity={0.45}
                />
                <stop
                  offset="100%"
                  stopColor="#0ea5e9"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              opacity={0.4}
            />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                stroke: "#0ea5e9",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                background: "rgb(15 23 42)",
                border: "1px solid rgb(51 65 85)",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "#cbd5e1",
                marginBottom: "4px",
              }}
            />

            <Area
              type="monotone"
              dataKey="applications"
              stroke="#0ea5e9"
              strokeWidth={1}
              fill="url(#applicationsGradient)"
              activeDot={{
                r: 5,
                fill: "#fff",
                stroke: "#0ea5e9",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;