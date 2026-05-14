import { Card } from "@/components/ui/card";
import { Briefcase, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "./StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";

const DashboardStats = () => {
  const stats = useDashboardStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

      <Card><StatCard icon={<Briefcase />} label="Total" value={stats.total} color="blue" /></Card>

      <Card><StatCard icon={<Clock />} label="In Progress" value={stats.inProgress} color="amber" /></Card>

      <Card><StatCard icon={<Calendar />} label="Interviews" value={stats.interviewed} color="purple" /></Card>

      <Card><StatCard icon={<CheckCircle2 />} label="Offers" value={stats.offered} color="green" /></Card>

      <Card><StatCard icon={<XCircle />} label="Rejections" value={stats.rejected} color="red" /></Card>

    </div>
  );
};

export default DashboardStats;