import React from "react";
import { Card } from "@/components/ui/card";
import { Stat } from "./statsCard";
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Props = {
  stats: {
    total: number;
    inProgress: number;
    interviewed: number;
    offered: number;
    rejections: number;
  };
};

const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="p-6 bg-blue-50 dark:bg-gray-900">
        <Stat icon={<Briefcase />} label="Total" value={stats.total} color="blue" />
      </Card>

      <Card className="p-6 bg-amber-50 dark:bg-gray-900">
        <Stat icon={<Clock />} label="Applied" value={stats.inProgress} color="amber" />
      </Card>

      <Card className="p-6 bg-purple-50 dark:bg-gray-900">
        <Stat icon={<Calendar />} label="Interviews" value={stats.interviewed} color="purple" />
      </Card>

      <Card className="p-6 bg-green-50 dark:bg-gray-900">
        <Stat icon={<CheckCircle2 />} label="Offers" value={stats.offered} color="green" />
      </Card>

      <Card className="p-6 bg-red-50 dark:bg-gray-900">
        <Stat icon={<XCircle />} label="Rejected" value={stats.rejections} color="red" />
      </Card>
    </div>
  );
};

export default DashboardStats;