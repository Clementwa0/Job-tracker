import { Briefcase, CheckCircle2, Users, Clock } from "lucide-react";
import StatCard from "./StatCard";

type Props = {
  metrics: {
    totalApplications: number;
    /** % change vs the previous period of the same length; null when there is no baseline. */
    applicationsTrend: number | null;
    interviewsScheduled: number;
    followUps: number;
    pendingDeadlines: number;
  };
  periodLabel?: string;
};

// Only real numbers are shown: Applications compares the selected period with
// the one before it; the other cards are forward-looking counts with no trend.
const MetricsGrid = ({ metrics, periodLabel }: Props) => (
  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
    <StatCard
      tone="blue"
      icon={<Briefcase className="h-4 w-4" />}
      title={periodLabel ? `Applications · ${periodLabel}` : "Applications"}
      value={metrics.totalApplications}
      trend={metrics.applicationsTrend ?? undefined}
    />
    <StatCard tone="green" icon={<CheckCircle2 className="h-4 w-4" />} title="Upcoming interviews" value={metrics.interviewsScheduled} />
    <StatCard tone="purple" icon={<Users className="h-4 w-4" />} title="Open follow-ups" value={metrics.followUps} />
    <StatCard tone="amber" icon={<Clock className="h-4 w-4" />} title="Upcoming deadlines" value={metrics.pendingDeadlines} />
  </div>
);

export default MetricsGrid;
