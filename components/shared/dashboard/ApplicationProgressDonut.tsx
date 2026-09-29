"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type ProgressSlice = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  total: number;
  slices: ProgressSlice[];
  title?: string;
  showViewAll?: boolean;
};

const ApplicationProgressDonut = ({
  total,
  slices,
  title = "Application Progress",
  showViewAll = true,
}: Props) => {
  const data = slices.filter((s) => s.value > 0);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
        {showViewAll && (
          <Link
            href="/jobseeker/applications"
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length ? data : [{ label: "None", value: 1, color: "var(--muted)" }]}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={58}
                paddingAngle={data.length > 1 ? 3 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                {(data.length ? data : [{ color: "var(--muted)" }]).map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-bold leading-none text-foreground">
              {total}
            </span>
            <span className="mt-1 text-[10px] text-muted-foreground">Total</span>
          </div>
        </div>

        <ul className="min-w-0 flex-1 space-y-2">
          {slices.map((s) => {
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full")}
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
                <span className="font-medium text-foreground">{s.value}</span>
                <span className="w-9 shrink-0 text-right text-[11px] text-muted-foreground">
                  {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

export default ApplicationProgressDonut;
