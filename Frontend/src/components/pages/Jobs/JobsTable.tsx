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

const columns: { key: SortField | "actions" | "salary"; label: string; sortable?: boolean; align?: "right" }[] = [
  { key: "jobTitle", label: "Role", sortable: true },
  { key: "applicationStatus", label: "Status", sortable: true },
  { key: "applicationDate", label: "Applied", sortable: true },
  { key: "applicationDeadline", label: "Deadline", sortable: true },
  { key: "salary", label: "Salary" },
  { key: "actions", label: "", align: "right" },
];

const formatDate = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

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
      setSortDirection("desc");
    }
  };

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aValue = (a[sortField] ?? "") as string;
      const bValue = (b[sortField] ?? "") as string;
      const cmp = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
      });
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [jobs, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-medium whitespace-nowrap",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key as SortField)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition"
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
                className="group hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 max-w-[280px]">
                  <div className="flex items-center gap-3">
                    <CompanyLogo
                      name={job.companyName}
                      logo={job.companyLogo}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {job.jobTitle || "Untitled role"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {job.companyName}
                        {job.location ? ` · ${job.location}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <JobStatusBadge status={job.applicationStatus} />
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(job.applicationDate)}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatDate(job.applicationDeadline)}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {job.salaryRange || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div
                    className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${job.jobTitle}`}
                      onClick={() => onEdit(job.id)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="More actions"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {job.jobPostingUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={job.jobPostingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open posting
                            </a>
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
                          <Trash2 className="h-4 w-4 mr-2" />
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
