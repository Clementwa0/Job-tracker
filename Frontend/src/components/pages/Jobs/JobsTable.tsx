import React, { useState } from "react";
import { ArrowDown, ArrowUp, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joblabel } from "@/constants";
import type { Job } from "@/types";

interface JobsTableProps {
  jobs: Job[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (job: Job) => void;
}

type SortField = keyof Pick<
  Job,
  "title" | "company" | "applicationDate" | "status"
>;

const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const [sortField, setSortField] = useState<SortField>("applicationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No jobs to display.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b border-border dark:bg-gray-900">
             {joblabel.map(({ label, field }) => (
                <th
                  key={label}
                  className="px-4 py-3 text-sm font-medium cursor-pointer"
                  onClick={
                    field ? () => handleSort(field as SortField) : undefined
                  }
                >
                  <div className="flex items-center gap-1">
                    {label} {field && <SortIcon field={field as SortField} />}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-sm font-medium text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedJobs.map((job) => (
              <tr
                key={job.id}
                className="group hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => onSelect?.(job)}
              >
                <td className="px-4 py-3 text-sm">{job.title}</td>
                <td className="px-4 py-3 text-sm">{job.company}</td>
                <td className="px-4 py-3 text-sm">{job.location}</td>
                <td className="px-4 py-3 text-sm">{job.jobType}</td>
                <td className="px-4 py-3 text-sm">{job.applicationDate}</td>
                <td className="px-4 py-3 text-sm">{job.applicationDeadline}</td>
                <td className="px-4 py-3 text-sm">
                  {job.salaryRange ? `KES ${job.salaryRange}` : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant={
                      job.status === "applied"
                        ? "default"
                        : job.status === "interview"
                        ? "secondary"
                        : job.status === "rejected"
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {job.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(job.id);
                      }}
                      className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(job.id);
                      }}
                      className="p-1 rounded-md hover:bg-destructive/10 text-destructive"
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
