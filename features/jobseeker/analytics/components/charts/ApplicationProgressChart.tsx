"use client";

import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export type ProgressPoint = {
  label: string;
  applications: number;
  interviews: number;
  offers: number;
  hired: number;
};

type Props = {
  data: ProgressPoint[];
};

const SERIES: { key: keyof ProgressPoint; name: string; color: string }[] = [
  { key: "applications", name: "Applications", color: "#3B82F6" },
  { key: "interviews", name: "Interviews", color: "#10B981" },
  { key: "offers", name: "Offers", color: "#8B5CF6" },
  { key: "hired", name: "Hired", color: "#F59E0B" },
];

const ApplicationProgressChart = ({ data }: Props) => {
  const hasData = data.some((d) => d.applications > 0);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Application Progress
          </h2>
        </div>
        <Link
          href="/jobseeker/applications"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          View Details
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {!hasData ? (
        <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No applications yet</p>
        </div>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-border" opacity={0.4} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "11px" }}
              />
              {SERIES.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default ApplicationProgressChart;
