import React, { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joblabel } from "@/constants";

import type { Job } from "@/types";
import type { JobsTableProps, SortField, SortDirection } from "./jobs-table.types";
import { sortJobs } from "./jobs-table.utils";

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const [sortField, setSortField] = useState<SortField>("applicationDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedJobs = sortJobs(jobs, sortField, sortDirection);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (!jobs.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No jobs to display.
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">

          <thead className="bg-muted/50">
            <tr>
              {joblabel.map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && handleSort(field as SortField)}
                  className="px-4 py-3 text-sm font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field as SortField} />}
                  </div>
                </th>
              ))}
              <th className="text-right px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedJobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onSelect?.(job)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <td className="px-4 py-3">{job.title}</td>
                <td>{job.company}</td>
                <td>{job.location}</td>
                <td>{job.jobType}</td>
                <td>{job.applicationDate}</td>
                <td>{job.applicationDeadline}</td>
                <td>
                  {job.salaryRange ? `KES ${job.salaryRange}` : "—"}
                </td>

                <td>
                  <Badge>{job.status}</Badge>
                </td>

                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(job.id);
                      }}
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(job.id);
                      }}
                      variant="ghost"
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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