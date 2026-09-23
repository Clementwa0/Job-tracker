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

type Props = {
  data: {
    type: string;
    count: number;
  }[];
};

const JobTypeBarChart = ({ data }: Props) => {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">
          Job Type Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="text-muted-foreground"
            />

            <XAxis
              dataKey="type"
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
              radius={[8, 8, 0, 0]}
              fill="#0ea5e9"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default JobTypeBarChart;