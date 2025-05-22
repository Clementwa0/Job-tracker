
import React from 'react';
import { JobStatus } from '../context/JobsContext';

interface StatusBadgeProps {
  status: JobStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'saved':
        return 'bg-status-saved/10 text-status-saved border border-status-saved/30';
      case 'applied':
        return 'bg-status-applied/10 text-status-applied border border-status-applied/30';
      case 'interview':
        return 'bg-status-interview/10 text-status-interview border border-status-interview/30';
      case 'offer':
        return 'bg-status-offer/10 text-status-offer border border-status-offer/30';
      case 'rejected':
        return 'bg-status-rejected/10 text-status-rejected border border-status-rejected/30';
      case 'accepted':
        return 'bg-status-accepted/10 text-status-accepted border border-status-accepted/30';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'saved':
        return 'Saved';
      case 'applied':
        return 'Applied';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      case 'accepted':
        return 'Accepted';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
