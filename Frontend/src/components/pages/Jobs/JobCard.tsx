import React from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Wallet,
  MoreHorizontal,
  Pencil,
  Trash2,
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

interface JobCardProps {
  job: Job;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const formatDate = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysUntil = (d?: string) => {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onClick }) => {
  const deadlineIn = daysUntil(job.applicationDeadline);
  const overdue = deadlineIn !== null && deadlineIn < 0;
  const soon = deadlineIn !== null && deadlineIn >= 0 && deadlineIn <= 3;

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${job.jobTitle} at ${job.companyName}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/70 bg-card p-4 text-left shadow-sm transition-all",
        "hover:shadow-md hover:border-border hover:-translate-y-0.5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "cursor-pointer",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.companyName} logo={job.companyLogo} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-snug text-foreground">
            {job.jobTitle || "Untitled role"}
          </h3>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {job.companyName || "—"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Job actions"
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
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
            <DropdownMenuItem onClick={() => onEdit?.(job.id)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(job.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status */}
      <div className="mt-3">
        <JobStatusBadge status={job.applicationStatus} />
      </div>

      {/* Meta grid */}
      <dl className="mt-4 grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
        {job.location && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Location</dt>
            <dd className="truncate">
              {job.location}
              {job.jobType ? ` · ${job.jobType}` : ""}
            </dd>
          </div>
        )}
        {job.salaryRange && (
          <div className="flex items-center gap-1.5 truncate">
            <Wallet className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Salary</dt>
            <dd className="truncate">{job.salaryRange}</dd>
          </div>
        )}
        {job.applicationDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Applied on</dt>
            <dd>Applied {formatDate(job.applicationDate)}</dd>
          </div>
        )}
        {job.applicationDeadline && (
          <div
            className={cn(
              "flex items-center gap-1.5",
              overdue && "text-rose-600 dark:text-rose-400",
              soon && "text-amber-600 dark:text-amber-400",
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Deadline</dt>
            <dd>
              {overdue
                ? `Overdue by ${Math.abs(deadlineIn!)}d`
                : soon
                  ? `Due in ${deadlineIn}d`
                  : `Due ${formatDate(job.applicationDeadline)}`}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
};

export default JobCard;
