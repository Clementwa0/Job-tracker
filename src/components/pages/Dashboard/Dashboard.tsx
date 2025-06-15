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
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockRecentActivity, mockStats, mockUpcomingInterviews } from '@/constants';




const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with Quick Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/add-job">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Application
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-blue-700">{mockStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-amber-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-amber-700">{mockStats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-purple-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Interviews</p>
              <p className="text-2xl font-bold text-purple-700">{mockStats.interviews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-green-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Offers</p>
              <p className="text-2xl font-bold text-green-700">{mockStats.offers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Rejections</p>
              <p className="text-2xl font-bold text-red-700">{mockStats.rejections}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 rounded-full bg-gray-100">
                    {activity.type === 'application' && <Briefcase className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'interview' && <Calendar className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'offer' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
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
                    {activity.details && (
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Application Status Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Application Status</h2>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              {/* Replace with actual chart component */}
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Application status chart will be displayed here</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Interviews */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
            <div className="space-y-4">
              {mockUpcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{interview.position}</p>
                      <p className="text-sm text-gray-600">{interview.company}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {interview.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{interview.stage.replace('_', ' ').toUpperCase()}</span>
                    {interview.location && (
                      <>
                        <span>•</span>
                        <span>{interview.location}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Reminders / To-Do */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reminders</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Follow up with Google</p>
                  <p className="text-sm text-amber-700">Send thank you email after interview</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Prepare for Amazon Interview</p>
                  <p className="text-sm text-blue-700">Review system design concepts</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
