"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SourceSlice = { label: string; value: number; color: string };

type Props = {
  data: SourceSlice[];
};

const SourceChart = ({ data }: Props) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Applications by Source
        </h2>
      </div>

      {total === 0 ? (
        <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={58}
                  paddingAngle={data.length > 1 ? 2 : 0}
                  stroke="var(--card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((s, i) => (
                    <Cell key={i} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} applications`, ""]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="min-w-0 flex-1 space-y-2">
            {data.map((s) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <li key={s.label} className="flex items-center gap-2 text-xs">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full")} style={{ backgroundColor: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                  <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default SourceChart;
