import { Briefcase, CheckCircle2, Users, Clock } from "lucide-react";
import StatCard from "./StatCard";

type Props = {
  metrics: {
    totalApplications: number;
    interviewsScheduled: number;
    followUps: number;
    pendingDeadlines: number;
  };
};

const MetricsGrid = ({ metrics }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        tone="blue"
        icon={<Briefcase className="h-5 w-5" />}
        title="Total Applications"
        value={metrics.totalApplications}
        trend={20}
      />
      <StatCard
        tone="green"
        icon={<CheckCircle2 className="h-5 w-5" />}
        title="Interviews Scheduled"
        value={metrics.interviewsScheduled}
        trend={67}
      />
      <StatCard
        tone="purple"
        icon={<Users className="h-5 w-5" />}
        title="Follow-ups"
        value={metrics.followUps}
        trend={33}
      />
      <StatCard
        tone="amber"
        icon={<Clock className="h-5 w-5" />}
        title="Pending Deadlines"
        value={metrics.pendingDeadlines}
        trend={-25}
      />
    </div>
  );
};

export default MetricsGrid;
