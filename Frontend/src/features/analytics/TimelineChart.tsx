import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyChart from "./charts/WeeklyChart";

const TimelineChart = () => {
  return (
    <Card className="bg-white dark:bg-slate-900 border dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">
          Application Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        <WeeklyChart />
      </CardContent>
    </Card>
  );
};

export default TimelineChart;