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
    <Card className="bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">
          Job Type Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="text-slate-200 dark:text-slate-800"
            />

            <XAxis
              dataKey="type"
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