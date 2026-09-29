"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export type SourceSlice = { label: string; value: number; color: string };

const SourceChart = ({ data }: { data: SourceSlice[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <Card className="border-border p-4 shadow-none sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
          By Source
        </h2>
      </div>

      {total === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={56}
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
                  formatter={(value: number) => [`${value} apps`, ""]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-1.5">
            {data.map((s) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <li key={s.label} className="flex items-center gap-2 text-[11px] sm:text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                  <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground">{pct}%</span>
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