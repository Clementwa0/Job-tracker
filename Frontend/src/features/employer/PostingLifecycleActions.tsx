import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmployerJobPosting } from "@/types/employer";

interface PostingLifecycleActionsProps {
  posting: EmployerJobPosting;
  onPublish: () => void;
  onUnpublish: () => void;
  onClose: () => void;
  onDelete: () => void;
  publishing?: boolean;
  acting?: boolean;
}

export default function PostingLifecycleActions({
  posting,
  onPublish,
  onUnpublish,
  onClose,
  onDelete,
  publishing,
  acting,
}: PostingLifecycleActionsProps) {
  const busy = publishing || acting;
  const canPublish = posting.status === "draft" || posting.status === "closed";
  const canUnpublish = posting.status === "published" || posting.status === "pending_review";
  const canClose = posting.status === "published";
  const canDelete = posting.status === "draft";

  return (
    <div className="flex flex-wrap gap-2">
      {canPublish && (
        <Button onClick={onPublish} disabled={busy}>
          {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {posting.status === "closed" ? "Reopen & publish" : "Publish"}
        </Button>
      )}
      {canUnpublish && (
        <Button variant="outline" onClick={onUnpublish} disabled={busy}>
          Unpublish
        </Button>
      )}
      {canClose && (
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Close listing
        </Button>
      )}
      {canDelete && (
        <Button variant="destructive" onClick={onDelete} disabled={busy}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete draft
        </Button>
      )}
    </div>
  );
}
