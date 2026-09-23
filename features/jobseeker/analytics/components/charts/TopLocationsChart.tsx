"use client";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ReactNode } from "react";

type Props = {
  title: string;
  icon?: ReactNode;
  data: {
    location: string;
    count: number;
  }[];
};

const TopLocationsChart = ({
  title,
  icon,
  data,
}: Props) => {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="2 2"
              className="text-muted-foreground"
            />

            <XAxis
              dataKey="location"
              stroke="currentColor"
              className="text-muted-foreground dark:text-muted-foreground"
            />

            <YAxis
              stroke="currentColor"
              className="text-muted-foreground dark:text-muted-foreground"
            />

            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                color: "#fff",
              }}
            />

            <Bar
              dataKey="count"
              fill="#facc15"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopLocationsChart;