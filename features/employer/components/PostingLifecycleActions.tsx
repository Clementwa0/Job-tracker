import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmployerJobPosting } from "@/types/employer";

interface PostingLifecycleActionsProps {
  posting: EmployerJobPosting;
  onUnpublish: () => void;
  onClose: () => void;
  onDelete: () => void;
  acting?: boolean;
}

/**
 * Unpublish / close / delete - the "step back" half of the lifecycle.
 * Moving a posting forward (draft/closed → published) lives on the
 * "Publish job" button in JobPostingForm instead, since that action needs
 * to save whatever is currently in the form first; a separate publish
 * button here would silently publish stale, previously-saved fields.
 */
export default function PostingLifecycleActions({
  posting,
  onUnpublish,
  onClose,
  onDelete,
  acting,
}: PostingLifecycleActionsProps) {
  const busy = acting;
  const canUnpublish = posting.status === "published" || posting.status === "pending_review";
  const canClose = posting.status === "published";
  const canDelete = posting.status === "draft";

  return (
    <div className="flex flex-wrap gap-2">
      {canUnpublish && (
        <Button type="button" variant="outline" onClick={onUnpublish} disabled={busy}>
          Unpublish
        </Button>
      )}
      {canClose && (
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Close listing
        </Button>
      )}
      {canDelete && (
        <Button type="button" variant="destructive" onClick={onDelete} disabled={busy}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete draft
        </Button>
      )}
    </div>
  );
}
