import { Badge } from "@/components/ui/badge";
import type { PostingStatus } from "@/types/employer";

const STYLES: Record<PostingStatus, string> = {
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  pending_review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
};

const LABELS: Record<PostingStatus, string> = {
  published: "Published",
  pending_review: "Pending",
  draft: "Draft",
  closed: "Closed",
};

export function JobStatusBadge({ status }: { status: string }) {
  const key = status as PostingStatus;
  return (
    <Badge variant="secondary" className={STYLES[key] || STYLES.draft}>
      {LABELS[key] || status}
    </Badge>
  );
}

export function JobTypeBadge({ type }: { type?: string }) {
  if (!type) return <span className="text-muted-foreground">—</span>;
  const label = type.replace("-", " ");
  return (
    <Badge variant="outline" className="capitalize font-normal">
      {label}
    </Badge>
  );
}
