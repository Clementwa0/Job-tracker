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

const MetricsGrid = ({ metrics }: Props) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
    <StatCard tone="blue" icon={<Briefcase className="h-4 w-4" />} title="Applications" value={metrics.totalApplications} trend={20} />
    <StatCard tone="green" icon={<CheckCircle2 className="h-4 w-4" />} title="Interviews" value={metrics.interviewsScheduled} trend={67} />
    <StatCard tone="purple" icon={<Users className="h-4 w-4" />} title="Follow-ups" value={metrics.followUps} trend={33} />
    <StatCard tone="amber" icon={<Clock className="h-4 w-4" />} title="Deadlines" value={metrics.pendingDeadlines} trend={-25} />
  </div>
);

export default MetricsGrid;