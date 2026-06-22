import { Card } from "@/components/ui/card";
import { useMemo, memo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface TimelinePoint {
  date: string;
  count: number;
}

interface WeeklyChartProps {
  timelineData?: TimelinePoint[];
}

const WeeklyChart = memo(({ timelineData }: WeeklyChartProps) => {
  const data = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const fromApi = timelineData?.find((t) => t.date === key);
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        key,
        applications: fromApi?.count ?? 0,
      };
    });
    return days;
  }, [timelineData]);

  return (
    <Card className="p-5 border border-border bg-card/80 backdrop-blur-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            This Week
          </h2>
          <p className="text-xs text-muted-foreground">Applications per day</p>
        </div>
        <div className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
          Last 7 Days
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="text-border" opacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "#0ea5e9", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="applications"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#applicationsGradient)"
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

WeeklyChart.displayName = "WeeklyChart";

export default WeeklyChart;
