"use client";

import { ClipboardList, Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmployerQuickActionsProps {
  onPostJob: () => void;
  /** View Job Postings now routes to the real jobs list — see button below. */
  onViewPostings: () => void;
}

/**
 * Two actions only, by design: post a job (primary) and view job postings
 * (secondary). Both route to the job postings workspace — "Post a Job" deep
 * links straight into a fresh draft via the caller-provided handler.
 */
export default function EmployerQuickActions({
  onPostJob,
  onViewPostings,
}: EmployerQuickActionsProps) {
  return (
    <Card className="border-border p-4 shadow-none">
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="font-display text-sm font-semibold tracking-tight text-foreground">
          Quick Actions
        </h2>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" onClick={onPostJob}>
          <Plus />
          Post a Job
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={onViewPostings}
        >
          <ClipboardList />
          View Job Postings
        </Button>
      </div>
    </Card>
  );
}
