import React from 'react';
import { Search, ArrowDownWideNarrow } from 'lucide-react';
import { statusOptions } from '@/constants';

interface JobsFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

const JobsFilter: React.FC<JobsFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <section aria-labelledby="filter-heading" className="mb-6">
      <h2 id="filter-heading" className="sr-only">Filter jobs</h2>
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-lg border border-border bg-muted/10 dark:bg-gray-800">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-900"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <ArrowDownWideNarrow className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background pl-8 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none dark:bg-gray-900"
            aria-label="Filter by status"
          >
            {statusOptions.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default JobsFilter;
