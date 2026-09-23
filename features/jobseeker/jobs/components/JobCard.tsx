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
import PriorityBadge from "./PriorityBadge";
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
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const daysUntil = (d?: string) => {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
        "group relative flex cursor-pointer flex-col rounded-xl border border-border/70 bg-card p-3.5 text-left shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="flex items-start gap-2.5">
        <CompanyLogo name={job.companyName} logo={job.companyLogo} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[13px] font-semibold leading-snug text-foreground">
            {job.jobTitle || "Untitled role"}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {job.companyName || "—"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Job actions"
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-6 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
              />
            }
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
            <DropdownMenuItem onClick={() => onEdit?.(job.id)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(job.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <JobStatusBadge status={job.applicationStatus} />
        {job.priority && <PriorityBadge priority={job.priority} />}
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-1 text-[11px] text-muted-foreground">
        {job.location && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <dt className="sr-only">Location</dt>
            <dd className="truncate">
              {job.location}
              {job.jobType ? ` · ${job.jobType}` : ""}
            </dd>
          </div>
        )}
        {job.salaryRange && (
          <div className="flex items-center gap-1.5 truncate">
            <Wallet className="h-3 w-3 shrink-0" aria-hidden />
            <dt className="sr-only">Salary</dt>
            <dd className="truncate">{job.salaryRange}</dd>
          </div>
        )}
        {job.applicationDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden />
            <dt className="sr-only">Applied on</dt>
            <dd>Applied {formatDate(job.applicationDate)}</dd>
          </div>
        )}
        {job.applicationDeadline && (
          <div
            className={cn(
              "flex items-center gap-1.5",
              overdue && "text-destructive",
              soon && "text-amber-600 dark:text-amber-400",
            )}
          >
            <Clock className="h-3 w-3 shrink-0" aria-hidden />
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

export default React.memo(JobCard);