import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ApplicationStatus } from "@/types/job";

type Datum = {
  key: ApplicationStatus;
  status: string;
  count: number;
};

type Props = {
  data: Datum[];
};

/**
 * MODERN COLOR PALETTE
 */
const STATUS_COLORS: Record<string, string> = {
  applied: "#3B82F6", // blue
  interviewing: "#8B5CF6", // violet
  offer: "#10B981", // emerald
  rejected: "#EF4444", // red
  shortlisted: "#F59E0B", // amber
  saved: "#06B6D4", // cyan
  ghosted: "#64748B", // slate
  withdrawn: "#F97316", // orange
};

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;

  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));

  const sx =
    (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;

  const sy =
    (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;

  const mx =
    (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;

  const my =
    (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;

  const ex = mx + (cos >= 0 ? 1 : -1) * 22;

  const ey = my;

  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* CENTER LABEL */}
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        className="text-sm font-semibold"
      >
        {payload.status}
      </text>

      {/* ACTIVE SLICE */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* OUTER RING */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 12}
        fill={fill}
        opacity={0.35}
      />

      {/* CONNECTOR */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={2}
      />

      <circle
        cx={ex}
        cy={ey}
        r={4}
        fill={fill}
        stroke="none"
      />

      {/* VALUE */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="currentColor"
        className="fill-foreground text-sm font-medium"
      >
        {`${value} Applications`}
      </text>

      {/* PERCENT */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#94a3b8"
        className="text-xs"
      >
        {`${((percent ?? 0) * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

const StatusPieChart = ({ data }: Props) => {
  return (
    <Card className="border border-border/60 bg-background/80 backdrop-blur-xl shadow-md">
      <CardHeader>
        <CardTitle className="text-foreground text-lg font-semibold">
          Application Status Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              margin={{
                top: 40,
                right: 120,
                bottom: 20,
                left: 120,
              }}
            >
              <Pie
                activeIndex={0}
                activeShape={renderActiveShape}
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={4}
                stroke="hsl(var(--background))"
                strokeWidth={3}
              >
                {data.map((d, index) => (
                  <Cell
                    key={d.key}
                    fill={
                      STATUS_COLORS[d.key] ||
                      [
                        "#3B82F6",
                        "#8B5CF6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444",
                        "#06B6D4",
                      ][index % 6]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number) => [
                  `${value} Applications`,
                  "Count",
                ]}
                contentStyle={{
                  background:
                    "hsl(var(--popover))",
                  border:
                    "1px solid hsl(var(--border))",
                  borderRadius: "14px",
                  color:
                    "hsl(var(--foreground))",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.15)",
                }}
                itemStyle={{
                  color:
                    "hsl(var(--foreground))",
                }}
                labelStyle={{
                  color:
                    "hsl(var(--foreground))",
                  fontWeight: 600,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;