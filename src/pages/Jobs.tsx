import React, { useState } from 'react';
import PageLayout from '../components/layouts/PageLayout';
import { useJobs, JobStatus } from '../context/JobsContext';
import JobCard from '../components/JobCard';
import { Link } from 'react-router-dom';

type ViewMode = 'Grid' | 'list';

const Jobs = () => {
  const { jobs, isLoading } = useJobs();
  const [viewMode, setViewMode] = useState<ViewMode>('Grid');

  // Define all job statuses in the order we want to display them
  const jobStatuses: JobStatus[] = ['saved', 'applied', 'interview', 'offer', 'accepted', 'rejected'];

  // Get jobs by status for a column
  const getJobsByStatus = (status: JobStatus) => jobs.filter(job => job.status === status);

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
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="mt-2 text-gray-600">Track and manage your job search progress</p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setViewMode('Grid')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    viewMode === 'Grid'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  List
                </button>
              </div>
              <Link
                to="/jobs/new"
                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Add Job
              </Link>
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            {jobStatuses.map(status => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">{getColumnTitle(status)}</div>
                <div className="text-2xl font-bold mt-1">{getJobsByStatus(status).length}</div>
              </div>
            ))}
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
