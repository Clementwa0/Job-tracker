import { Card } from "@/components/ui/card";
import { useJobs } from "@/hooks/JobContext";
import { useMemo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
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
      const date = j.applicationDate ? new Date(j.applicationDate) : null;
      if (!date || Number.isNaN(date.getTime())) return;

      const k = date.toISOString().slice(0, 10);
      const slot = days.find((d) => d.key === k);
      if (slot) slot.applications += 1;
    });
    return days;
  }, [jobs]);

  return (
    <Card className="p-5 border-border/60 bg-card/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold tracking-tight">This week</h2>
        <p className="text-xs text-muted-foreground">Applications per day</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;
