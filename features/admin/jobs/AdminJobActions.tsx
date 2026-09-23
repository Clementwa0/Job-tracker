"use client";

import { Button } from "@/components/ui/button";
import { setJobStatus } from "@/features/admin/dummy/adminDummyStore";
import type { AdminJobPosting } from "@/types/admin";

interface AdminJobActionsProps {
  job: AdminJobPosting;
  onView: (job: AdminJobPosting) => void;
}

/**
 * Moderation actions for a single job posting, acting directly on the shared
 * dummy store. Draft postings haven't been submitted for review yet, so no
 * moderation action is offered for them beyond viewing.
 */
export default function AdminJobActions({ job, onView }: AdminJobActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button size="sm" variant="ghost" onClick={() => onView(job)}>
        View
      </Button>
      {job.status === "pending_review" && (
        <>
          <Button size="sm" variant="outline" onClick={() => setJobStatus(job.id, "published")}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setJobStatus(job.id, "draft")}
          >
            Reject
          </Button>
        </>
      )}
      {job.status === "published" && (
        <Button size="sm" variant="outline" onClick={() => setJobStatus(job.id, "closed")}>
          Close
        </Button>
      )}
      {job.status === "closed" && (
        <Button size="sm" variant="outline" onClick={() => setJobStatus(job.id, "published")}>
          Reopen
        </Button>
      )}
    </div>
  );
}
