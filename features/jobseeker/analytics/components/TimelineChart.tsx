import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyChart from "./charts/WeeklyChart";

interface TimelineChartProps {
  timelineData?: { date: string; count: number }[];
}

const TimelineChart = ({ timelineData }: TimelineChartProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Application Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <WeeklyChart timelineData={timelineData} />
      </CardContent>
    </Card>
  );
};

export default TimelineChart;
