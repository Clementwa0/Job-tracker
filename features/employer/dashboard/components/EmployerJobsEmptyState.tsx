"use client";

import type { ReactNode } from "react";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployerJobsEmptyStateProps {
  /** Shows the primary "Post a Job" button. */
  onPostJob?: () => void;
  title?: string;
  description?: string;
  /** Replaces the default briefcase icon. */
  icon?: ReactNode;
  /** Optional custom action, e.g. "Set up company profile" or "Clear filters". */
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmployerJobsEmptyState({
  onPostJob,
  title = "No job postings yet",
  description = "Your published and draft roles will show up here once you post your first job.",
  icon,
  actionLabel,
  onAction,
}: EmployerJobsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon ?? <Briefcase className="h-5 w-5 text-muted-foreground" />}
      </div>
      <p className="mt-3 text-xs font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">{description}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {onAction && actionLabel && (
          <Button size="sm" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {onPostJob && (
          <Button size="sm" onClick={onPostJob}>
            <Plus />
            Post a Job
          </Button>
        )}
      </div>
    </div>
  );
}
