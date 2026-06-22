import { Badge } from "@/components/ui/badge";
import type { PostingStatus } from "@/types/employer";
import { cn } from "@/lib/utils";

const STYLES: Record<PostingStatus, string> = {
  draft: "bg-slate-500/15 text-slate-700 dark:text-slate-300",
  pending_review: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  closed: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const LABELS: Record<PostingStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  closed: "Closed",
};

export default function PostingStatusBadge({ status }: { status: PostingStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-normal", STYLES[status])}>
      {LABELS[status]}
    </Badge>
  );
}
