import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Plus,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useJobs } from '@/hooks/JobContext';
import { Charts } from '@/components';

const Dashboard: React.FC = () => {
  const { jobs } = useJobs();

const stats = React.useMemo(() => {
  const total = jobs.length;
  const inProgress = jobs.filter(j => j.status?.toLowerCase() === 'applied').length;
  const interviewed = jobs.filter(j => j.status?.toLowerCase() === 'interviewing').length;
  const offered = jobs.filter(j => j.status?.toLowerCase() === 'offer').length;
  const rejections = jobs.filter(j => j.status?.toLowerCase() === 'rejected').length;
  return { total, inProgress, interviewed, offered, rejections };
}, [jobs]);


  const recentActivity = React.useMemo(() => {
    return [...jobs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(job => ({
        id: job.id,
        type: job.status === 'offered' ? 'offer'
          : job.status === 'rejected' ? 'rejection'
          : job.status === 'interviewed' ? 'interview'
          : 'application',
        company: job.company,
        position: job.title,
        date: new Date(job.date)
      }));
  }, [jobs]);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/add-job">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50 ">
          <Stat icon={<Briefcase className="h-6 w-6 text-blue-600" />} label="Total Applications" value={stats.total} color="blue" />
        </Card>
        <Card className="p-6 bg-amber-50">
          <Stat icon={<Clock className="h-6 w-6 text-amber-600" />} label="In Progress" value={stats.inProgress} color="amber" />
        </Card>
        <Card className="p-6 bg-purple-50">
          <Stat icon={<Calendar className="h-6 w-6 text-purple-600" />} label="Interviews" value={stats.interviewed} color="purple" />
        </Card>
        <Card className="p-6 bg-green-50">
          <Stat icon={<CheckCircle2 className="h-6 w-6 text-green-600" />} label="Offers" value={stats.offered} color="green" />
        </Card>
        <Card className="p-6 bg-red-50">
          <Stat icon={<XCircle className="h-6 w-6 text-red-600" />} label="Rejections" value={stats.rejections} color="red" />
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 gap-8">
        {/* Left - Activity & Chart */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-gray-500">No recent activity.</div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-full bg-gray-100">
                      {activity.type === 'application' && <Briefcase className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'interviewed' && <Calendar className="h-5 w-5 text-purple-600" />}
                      {activity.type === 'offered' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {activity.type === 'rejection' && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.position}</p>
                          <p className="text-sm text-gray-600">{activity.company}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Application Status</h2>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Application status chart will be displayed here</p>
              </div>
            </div>
          </Card>
        </div>
        {/* right */}
         <div className="space-y-6">
         <Charts/>
        </div>
      </div>
    </div>
  );
};

const Stat = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "amber" | "purple" | "green" | "red";
}) => {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100 text-blue-700",
    amber: "text-amber-600 bg-amber-100 text-amber-700",
    purple: "text-purple-600 bg-purple-100 text-purple-700",
    green: "text-green-600 bg-green-100 text-green-700",
    red: "text-red-600 bg-red-100 text-red-700",
  };

  const [textColor, bgColor, valueColor] = colorClasses[color].split(" ");

  return (
    <div className=" flex items-start  lg:items-center gap-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-medium ${textColor}`}>{label}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
};


export default Dashboard;
