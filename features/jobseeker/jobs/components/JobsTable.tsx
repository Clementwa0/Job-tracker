"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Pencil,
  Trash2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/job";
import JobStatusBadge from "./JobStatusBadge";
import CompanyLogo from "./CompanyLogo";

export type { Job };

interface JobsTableProps {
  jobs: Job[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (job: Job) => void;
}

type SortField =
  | "jobTitle"
  | "companyName"
  | "applicationDate"
  | "applicationDeadline"
  | "applicationStatus";

const columns: {
  key: SortField | "actions" | "salary";
  label: string;
  sortable?: boolean;
  align?: "right";
}[] = [
  { key: "jobTitle", label: "Role", sortable: true },
  { key: "applicationStatus", label: "Status", sortable: true },
  { key: "applicationDate", label: "Applied", sortable: true },
  { key: "applicationDeadline", label: "Deadline", sortable: true },
  { key: "salary", label: "Salary" },
  { key: "actions", label: "", align: "right" },
];

const formatDate = (d?: string) => {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const JobsTable: React.FC<JobsTableProps> = ({ jobs, onEdit, onDelete, onSelect }) => {
  const [sortField, setSortField] = useState<SortField>("applicationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aValue = (a[sortField] ?? "") as string;
      const bValue = (b[sortField] ?? "") as string;
      const cmp = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [jobs, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-3 py-2 font-medium",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key as SortField)}
                      className="inline-flex items-center gap-1 transition hover:text-foreground"
                      aria-sort={
                        sortField === col.key
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      {col.label}
                      <SortIcon field={col.key as SortField} />
                    </button>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sortedJobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onSelect?.(job)}
                className="group cursor-pointer transition-colors hover:bg-muted/40"
              >
                <td className="max-w-[280px] px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo name={job.companyName} logo={job.companyLogo} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-display font-medium text-foreground">
                        {job.jobTitle || "Untitled role"}
                      </div>
                      <div className="truncate text-[10.5px] text-muted-foreground">
                        {job.companyName}
                        {job.location ? ` · ${job.location}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <JobStatusBadge status={job.applicationStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {formatDate(job.applicationDate)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {formatDate(job.applicationDeadline)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {job.salaryRange || "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div
                    className="inline-flex items-center gap-0.5 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${job.jobTitle}`}
                      onClick={() => onEdit(job.id)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="More actions"
                            className="h-7 w-7"
                          />
                        }
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {job.jobPostingUrl && (
                          <DropdownMenuItem
                            render={
                              <a
                                href={job.jobPostingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              />
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open posting
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onSelect?.(job)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(job.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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