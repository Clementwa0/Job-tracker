"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList,
} from "recharts";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export type SkillDatum = { skill: string; rate: number };

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#0EA5E9"];

const SkillsMatchChart = ({ data }: { data: SkillDatum[] }) => (
  <Card className="border-border p-4 shadow-none sm:p-5">
    <div className="mb-3 flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-primary" />
      <h2 className="font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
        Skills Match
      </h2>
    </div>

    {data.length === 0 ? (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border px-4">
        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Match a resume to a job to see top matched skills
        </p>
      </div>
    ) : (
      <div className="h-48 w-full sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="text-border" opacity={0.4} vertical={false} />
            <XAxis dataKey="skill" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Match"]}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "11px",
              }}
            />
            <Bar dataKey="rate" radius={[5, 5, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="rate" position="top" formatter={(v: number) => `${v}%`} fontSize={10} />
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </Card>
);

export default SkillsMatchChart;