import React from "react";
import { Search, ArrowDownWideNarrow } from "lucide-react";
import { statusOptions } from "@/constants";
import type { JobsFilterProps } from "./jobs-filter.types";

const JobsFilter: React.FC<JobsFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <section className="mb-6">
      <div className="flex flex-col md:flex-row gap-3 p-4 border rounded-lg bg-muted/10 dark:bg-gray-800">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search jobs..."
            className="w-full h-9 pl-9 pr-3 border rounded-md text-sm dark:bg-gray-900"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <ArrowDownWideNarrow className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 pl-9 pr-6 border rounded-md text-sm appearance-none dark:bg-gray-900"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>
    </section>
  );
};

export default JobsFilter;