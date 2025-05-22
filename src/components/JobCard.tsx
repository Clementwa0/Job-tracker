
import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../context/JobsContext';
import StatusBadge from './StatusBadge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const getUpcomingInterview = () => {
    if (!job.interviews || job.interviews.length === 0) return null;
    
    // Sort interviews by date and get the first upcoming one
    const upcomingInterviews = job.interviews
      .filter(interview => new Date(interview.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return upcomingInterviews[0];
  };
  
  const upcomingInterview = getUpcomingInterview();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{job.title}</h3>
          <p className="text-gray-600 text-sm">{job.company}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      
      <p className="text-sm text-gray-500 mb-4">{job.location}</p>
      
      <div className="text-sm text-gray-600 mb-5">
        {job.description.length > 100 
          ? `${job.description.substring(0, 100)}...` 
          : job.description}
      </div>
      
      {job.dateApplied && (
        <div className="text-xs text-gray-500 mb-3">
          Applied: {formatDate(job.dateApplied)}
        </div>
      )}
      
      {upcomingInterview && (
        <div className="flex items-center text-xs text-primary mb-4 bg-primary/5 p-2 rounded">
          <Calendar size={14} className="mr-1" />
          <span>
            Interview: {formatDate(upcomingInterview.date)} at {upcomingInterview.time}
          </span>
        </div>
      )}
      
      <div className="mt-3">
        <Link 
          to={`/jobs/${job.id}`} 
          className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
