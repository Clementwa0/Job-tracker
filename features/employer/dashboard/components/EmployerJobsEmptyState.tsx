"use client";

import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployerJobsEmptyStateProps {
  onPostJob?: () => void;
  title?: string;
  description?: string;
}

export default function EmployerJobsEmptyState({
  onPostJob,
  title = "No job postings yet",
  description = "Your published and draft roles will show up here once you post your first job.",
}: EmployerJobsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-xs font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-[11px] text-muted-foreground">{description}</p>
      {onPostJob && (
        <Button size="sm" className="mt-3" onClick={onPostJob}>
          <Plus />
          Post a Job
        </Button>
      )}
    </div>
  );
}
