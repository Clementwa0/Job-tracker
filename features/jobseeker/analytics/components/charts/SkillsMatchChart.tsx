"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export type SkillDatum = { skill: string; rate: number };

type Props = {
  data: SkillDatum[];
};

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#0EA5E9"];

const SkillsMatchChart = ({ data }: Props) => {
  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Skills Match Rate
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-center text-sm text-muted-foreground px-4">
            Match a resume to a job to see your top matched skills
          </p>
        </div>
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="text-border" opacity={0.4} vertical={false} />
              <XAxis
                dataKey="skill"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Match rate"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                <LabelList dataKey="rate" position="top" formatter={(v: number) => `${v}%`} fontSize={11} />
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
};

export default SkillsMatchChart;
