import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';

// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  date: string;
  status: 'applied' | 'interviewed' | 'offered' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface JobsTableProps {
  jobs: Job[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortField = 'title' | 'company' | 'date' | 'status' | 'priority';

const JobsTable: React.FC<JobsTableProps> = ({ jobs, onEdit, onDelete }) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortField === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    // For other fields, do string comparison
    const aValue = a[sortField as keyof Job];
    const bValue = b[sortField as keyof Job];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border">
              <th 
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center">
                  Company
                  <SortIcon field="company" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  Priority
                  <SortIcon field="priority" />
                </div>
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedJobs.map((job) => (
              <tr 
                key={job.id} 
                className="group hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm">{job.title}</td>
                <td className="px-4 py-3 text-sm">{job.company}</td>
                <td className="px-4 py-3 text-sm">{job.date}</td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge type="status" value={job.status} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge type="priority" value={job.priority} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(job.id)}
                      className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                      aria-label="Edit job"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="p-1 rounded-md hover:bg-destructive/10 text-destructive"
                      aria-label="Delete job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobsTable;