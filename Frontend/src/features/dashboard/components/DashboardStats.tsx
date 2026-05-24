import { Briefcase, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const DashboardStats = () => {
  const stats = useDashboardStats();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard icon={<Briefcase className="h-5 w-5" />} label="Total"       value={stats.total}       color="blue"   trend={12} />
      <StatCard icon={<Clock className="h-5 w-5" />}     label="Active" value={stats.inProgress}  color="amber"  trend={4} />
      <StatCard icon={<Calendar className="h-5 w-5" />}  label="Interviews"  value={stats.interviewed} color="purple" trend={8} />
      <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Offers"   value={stats.offered}     color="green"  trend={2} />
      <StatCard icon={<XCircle className="h-5 w-5" />}   label="Rejections"  value={stats.rejected}    color="red"    trend={-3} />
    </div>
  );
};

export default DashboardStats;
