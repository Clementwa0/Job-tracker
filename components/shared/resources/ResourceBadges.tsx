import { Badge } from "@/components/ui/badge";
import { RESOURCE_TYPE_LABELS, type ResourceStatus, type ResourceType } from "@/lib/resources/constants";
import { cn } from "@/lib/utils";

export function ResourceTypeBadge({ type, className }: { type: ResourceType; className?: string }) {
  return (
    <Badge variant="secondary" className={className}>
      {RESOURCE_TYPE_LABELS[type]}
    </Badge>
  );
}

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "published"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}
