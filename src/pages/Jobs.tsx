import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  BookmarkCheck,
  SendHorizonal,
  Users2,
  Award,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Building2
} from 'lucide-react';
import PageLayout from '../components/layouts/PageLayout';
import { useJobs, JobStatus } from '../context/JobsContext';
import JobCard from '../components/JobCard';

type ViewMode = 'Grid' | 'list';
type SortOption = 'newest' | 'alphabetical' | 'status';

const statusConfig = {
  saved: { icon: BookmarkCheck, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  applied: { icon: SendHorizonal, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  interview: { icon: Users2, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  offer: { icon: Award, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  accepted: { icon: CheckCircle2, color: 'bg-green-50 text-green-600 border-green-200' },
  rejected: { icon: XCircle, color: 'bg-red-50 text-red-600 border-red-200' }
};

const Jobs = () => {
  const { jobs, isLoading } = useJobs();
  const [viewMode, setViewMode] = useState<ViewMode>('Grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const jobStatuses: JobStatus[] = ['saved', 'applied', 'interview', 'offer', 'accepted', 'rejected'];

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'status':
        return filtered.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return filtered.sort((a, b) => 
          new Date(b.dateApplied || '').getTime() - new Date(a.dateApplied || '').getTime()
        );
    }
  }, [jobs, searchQuery, sortBy]);

  const getJobsByStatus = (status: JobStatus) => 
    filteredAndSortedJobs.filter(job => job.status === status);

  const getColumnTitle = (status: JobStatus) => {
    const titles = {
      saved: 'Saved',
      applied: 'Applied',
      interview: 'Interview',
      offer: 'Offer',
      accepted: 'Accepted',
      rejected: 'Rejected'
    };
    return titles[status] || 'Unknown';
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 p-6 backdrop-blur-lg bg-opacity-90">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="mt-2 text-gray-600">Tracking {jobs.length} applications</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="newest">Newest First</option>
                <option value="alphabetical">A-Z</option>
                <option value="status">By Status</option>
              </select>

              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  onClick={() => setViewMode('Grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'Grid' 
                      ? 'bg-white shadow-sm text-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              <Link
                to="/jobs/new"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Plus size={20} />
                <span>Add Job</span>
              </Link>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {jobStatuses.map(status => {
              const StatusIcon = statusConfig[status].icon;
              return (
                <div
                  key={status}
                  className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${statusConfig[status].color}`}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon size={16} />
                    <span className="text-sm font-medium">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {getJobsByStatus(status).length}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={viewMode === 'Grid' ? 'space-y-6' : ''}>
            {/* Grid View */}
            {viewMode === 'Grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobStatuses.map(status => {
                  const statusJobs = getJobsByStatus(status);
                  if (statusJobs.length === 0) return null;

                  return (
                    <div key={status} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {getColumnTitle(status)}
                        </h2>
                        <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                          {statusJobs.length}
                        </span>
                      </div>
                      <div className="space-y-4 min-h-[100px]">
                        {statusJobs.map(job => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Job
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Company
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                          Applied Date
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.location}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{job.company}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {getColumnTitle(job.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="text-primary hover:text-primary/80 font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Jobs;
