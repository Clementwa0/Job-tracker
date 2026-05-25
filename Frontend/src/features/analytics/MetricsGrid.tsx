import {
  CalendarDays,
  Briefcase,
  Clock,
  TrendingUp,
} from "lucide-react";

import StatCard from "./StatCard";

type Props = {
  metrics: any;
};

const MetricsGrid = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        title="Total Applications"
        icon={<Briefcase />}
        value={metrics.totalJobs}
        description="Applications submitted"
      />

      <StatCard
        title="Interview Rate"
        icon={<TrendingUp />}
        value={`${metrics.interviewRate}%`}
        description="Applications to interviews"
      />

      <StatCard
        title="Offer Rate"
        icon={<Clock />}
        value={`${metrics.offerRate}%`}
        description="Applications to offers"
      />

      <StatCard
        title="Active Applications"
        icon={<CalendarDays />}
        value={metrics.activeApplications}
        description="Awaiting responses"
      />
    </div>
  );
};

export default MetricsGrid;