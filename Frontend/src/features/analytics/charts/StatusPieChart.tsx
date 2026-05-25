import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { STATUS_META } from "@/constants";

type Props = {
  data: {
    key: string;
    status: string;
    count: number;
    percentage?: string;
  }[];
};

const fallbackColor = "#90aed8";

const StatusPieChart = ({ data }: Props) => {
  return (
    <Card className="border border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">
          Application Status Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* CHART */}
          <div className="h-60 w-60 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                  label={({ status, percent }) =>
                    `${status} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.map((d) => (
                    <Cell
                      key={d.key}
                      fill={
                        STATUS_META[
                          d.key as keyof typeof STATUS_META
                        ]?.color || fallbackColor
                      }
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border:
                      "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    fontSize: "13px",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEGEND */}
          <div className="flex-1 w-full space-y-3">
            {data.map((d) => {
              const color =
                STATUS_META[
                  d.key as keyof typeof STATUS_META
                ]?.color || fallbackColor;

              return (
                <div
                  key={d.key}
                  className="
                    flex items-center justify-between
                    rounded-xl border
                    border-border/60
                    bg-muted/30
                    px-4 py-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <span className="text-sm font-medium text-foreground">
                      {d.status}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {d.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;