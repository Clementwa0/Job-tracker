"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService } from "@/features/admin/services/admin.client";
import { getApiErrorMessage } from "@/lib/apiError";
import type { AdminJobPosting } from "@/types/admin";

interface AdminJobActionsProps {
  job: AdminJobPosting;
  onView: (job: AdminJobPosting) => void;
  /** Called after a moderation action succeeds so the list can refetch. */
  onChanged: () => void;
}

/**
 * Moderation actions for a single job posting. Draft postings haven't been
 * submitted for review yet, so no moderation action is offered for them
 * beyond viewing.
 */
export default function AdminJobActions({ job, onView, onChanged }: AdminJobActionsProps) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
      // Refetch on failure too: a 409 means someone else already changed this posting.
      onChanged();
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Button size="sm" variant="ghost" onClick={() => onView(job)}>
        View
      </Button>
      {job.status === "pending_review" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => run(() => adminService.approveJob(job.id), "Job approved and published")}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            className="text-destructive hover:text-destructive"
            onClick={() => run(() => adminService.rejectJob(job.id), "Job sent back to draft")}
          >
            Reject
          </Button>
        </>
      )}
      {job.status === "published" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => adminService.closeJob(job.id), "Job closed")}
        >
          Close
        </Button>
      )}
      {job.status === "closed" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => adminService.reopenJob(job.id), "Job reopened")}
        >
          Reopen
        </Button>
      )}
    </div>
  );
}
