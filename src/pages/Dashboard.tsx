import React from 'react';
import PageLayout from '../components/layouts/PageLayout';
import { useJobs, JobStatus } from '../context/JobsContext';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Users, Award, Calendar } from 'lucide-react';

const StatsCard = ({ title, value, icon, trend }: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend: string;
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        {icon}
      </div>
    </div>
    <div className="mt-2 flex items-center text-sm">
      <span className={`font-medium ${trend.includes('↑') ? 'text-green-600' : 'text-gray-600'}`}>
        {trend}
      </span>
    </div>
  </div>
);

const Dashboard = () => {
  const { jobs, isLoading } = useJobs();

  // Calculate statistics
  const getStatusCount = (status: JobStatus) => {
    return jobs.filter(job => job.status === status).length;
  };

  const totalApplications = jobs.length;
  const appliedJobs = jobs.filter(job => job.status !== 'saved').length;
  const offerJobs = getStatusCount('offer') + getStatusCount('accepted');
  const successRate = appliedJobs > 0 ? Math.round((offerJobs / appliedJobs) * 100) : 0;
  
  const totalActive = jobs.filter(job => !['rejected', 'accepted'].includes(job.status)).length;
  const upcomingInterviews = jobs.filter(job => 
    job.interviews?.some(interview => new Date(interview.date) >= new Date())
  ).length;

  const recentActivity = jobs
    .sort((a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime())
    .slice(0, 3);

  // Prepare data for pie chart
  const statusColors = {
    saved: '#93c5fd',     // status-saved
    applied: '#60a5fa',   // status-applied
    interview: '#3b82f6', // status-interview
    offer: '#2563eb',     // status-offer
    rejected: '#ef4444',  // status-rejected
    accepted: '#22c55e',  // status-accepted
  };

  const pieData = Object.entries(statusColors).map(([status, color]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: getStatusCount(status as JobStatus),
    color
  })).filter(item => item.value > 0);

  // Prepare timeline data
  const getTimelineData = () => {
    if (jobs.length === 0) return [];
    
    // Find earliest and latest application dates
    const dates = jobs.filter(job => job.dateApplied)
                      .map(job => new Date(job.dateApplied as string));
    if (dates.length === 0) return [];
    
    const earliestDate = dates.reduce((a, b) => a < b ? a : b);
    const latestDate = new Date();
    
    // Create date range
    const dateRange = eachDayOfInterval({ start: earliestDate, end: latestDate });
    
    // Count applications per day
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = jobs.filter(job => 
        job.dateApplied && format(new Date(job.dateApplied), 'yyyy-MM-dd') === dateStr
      ).length;
      
      return {
        date: dateStr,
        count
      };
    });
  };

  const timelineData = getTimelineData();

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-xl shadow-sm border border-border">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back 👋</h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your job applications.</p>
          </div>
          <Link
            to="/jobs/new"
            className="mt-4 sm:mt-0 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 
            transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl 
            hover:shadow-primary/20 active:transform-none flex items-center justify-center gap-2"
          >
            <span className="text-sm font-medium">Add New Job</span>
            <span className="text-lg">+</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <StatsCard
                title="Total Applications"
                value={totalApplications}
                icon={<Users className="w-6 h-6" />}
                trend={totalApplications > 0 ? "+12% ↑" : "0%"}
              />
              <StatsCard
                title="Active Applications"
                value={totalActive}
                icon={<TrendingUp className="w-6 h-6" />}
                trend={totalActive > 0 ? "+5% ↑" : "0%"}
              />
              <StatsCard
                title="Success Rate"
                value={`${successRate}%`}
                icon={<Award className="w-6 h-6" />}
                trend={successRate > 0 ? "+2% ↑" : "0%"}
              />
              <StatsCard
                title="Upcoming Interviews"
                value={upcomingInterviews}
                icon={<Calendar className="w-6 h-6" />}
                trend={upcomingInterviews > 0 ? "Next: Today" : "None"}
              />
            </div>

            {/* Charts Section - Pie Chart and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart for Job Status */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-lg font-semibold mb-4">Jobs by Status</h2>
                <div className="h-64">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} jobs`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-lg font-semibold mb-4">Application Timeline</h2>
                <div className="h-64">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(tick) => format(new Date(tick), 'MMM d')}
                          interval={Math.floor(timelineData.length / 5)}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip 
                          labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                          formatter={(value) => [`${value} applications`, 'Count']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No timeline data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
              <h2 className="text-lg font-semibold mb-4">Application Status</h2>
              <div className="space-y-4">
                {/* Saved */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Saved</span>
                    <span>{getStatusCount('saved')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-saved h-2 rounded-full"
                      style={{ width: `${(getStatusCount('saved') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Applied */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Applied</span>
                    <span>{getStatusCount('applied')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-applied h-2 rounded-full"
                      style={{ width: `${(getStatusCount('applied') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Interview */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Interview</span>
                    <span>{getStatusCount('interview')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-interview h-2 rounded-full"
                      style={{ width: `${(getStatusCount('interview') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Offer */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Offer</span>
                    <span>{getStatusCount('offer')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-offer h-2 rounded-full"
                      style={{ width: `${(getStatusCount('offer') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Rejected */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Rejected</span>
                    <span>{getStatusCount('rejected')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-rejected h-2 rounded-full"
                      style={{ width: `${(getStatusCount('rejected') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Accepted */}
                <div className="flex flex-col">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Accepted</span>
                    <span>{getStatusCount('accepted')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-status-accepted h-2 rounded-full"
                      style={{ width: `${(getStatusCount('accepted') / totalApplications) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Link
                  to="/jobs"
                  className="text-primary text-sm hover:underline"
                >
                  View all jobs
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentActivity.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
