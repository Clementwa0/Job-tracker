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
    <Card className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="2 2"
              className="text-slate-200 dark:text-slate-800"
            />

            <XAxis
              dataKey="location"
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
            />

            <YAxis
              stroke="currentColor"
              className="text-slate-500 dark:text-slate-400"
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