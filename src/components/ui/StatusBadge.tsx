
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'applied' | 'interviewed' | 'offered' | 'rejected' | 'completed';
type PriorityType = 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  type: 'status' | 'priority';
  value: StatusType | PriorityType;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className }) => {
  const getClassName = () => {
    if (type === 'status') {
      return `status-badge status-${value}`;
    } else {
      return `status-badge priority-${value}`;
    }
  };

  const getLabel = () => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <span className={cn(getClassName(), className)}>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
