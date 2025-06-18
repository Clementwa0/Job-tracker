import React from 'react';
import { Button } from './button';

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  date: string;
  status: string;
  priority: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  company,
  date,
  status,
  priority,
  onEdit,
  onDelete,
}) => (
  <div className="bg-card rounded-lg border border-border p-4 flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <span className="text-xs text-muted-foreground">{date}</span>
    </div>
    <div className="text-sm text-muted-foreground">{company}</div>
    <div className="flex gap-2 mt-2">
      <span className="px-2 py-1 rounded bg-muted text-xs">{status}</span>
      <span className="px-2 py-1 rounded bg-muted text-xs">{priority}</span>
    </div>
    <div className="flex gap-2 mt-4">
      <Button size="sm" onClick={() => onEdit(id)}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(id)}>
        Delete
      </Button>
    </div>
  </div>
);

export default JobCard;