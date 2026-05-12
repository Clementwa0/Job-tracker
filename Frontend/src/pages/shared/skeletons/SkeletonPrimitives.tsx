import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Single line of text placeholder */
export function SkeletonText({
  className,
  width = "full",
}: {
  className?: string;
  width?: "full" | "3/4" | "1/2" | "1/3" | "1/4";
}) {
  const widthClass = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/3": "w-1/3",
    "1/4": "w-1/4",
  }[width];
  return <Skeleton className={cn("h-4", widthClass, className)} />;
}

/** Page header with title + optional action */
export function SkeletonHeader({
  hasSubtitle = true,
  hasAction = true,
}: {
  hasSubtitle?: boolean;
  hasAction?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 md:w-64" />
        {hasSubtitle && <Skeleton className="h-4 w-64 md:w-80" />}
      </div>
      {hasAction && <Skeleton className="h-10 w-28 md:w-32 shrink-0" />}
    </div>
  );
}

/** Stat/metric card placeholder */
export function SkeletonStatCard() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card dark:bg-gray-800/50">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>
    </div>
  );
}

/** Generic card with optional header */
export function SkeletonCard({
  hasHeader = true,
  lines = 4,
}: {
  hasHeader?: boolean;
  lines?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card dark:bg-gray-800/50 overflow-hidden">
      {hasHeader && (
        <div className="p-4 border-b border-border">
          <Skeleton className="h-5 w-40" />
        </div>
      )}
      <div className="p-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1 min-w-0">
              <Skeleton className="h-4 w-full max-w-[180px]" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Job card placeholder - matches JobCard layout */
export function SkeletonJobCard() {
  return (
    <div
      className="p-4 border border-border rounded-lg shadow-sm bg-card dark:bg-gray-800/50 space-y-3"
      data-slot="skeleton-job-card"
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-14 rounded" />
          <Skeleton className="h-8 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

/** Table row placeholder */
export function SkeletonTableRow({ columns = 7 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn("h-4", i === columns - 1 ? "w-20 ml-auto" : "w-full")} />
        </td>
      ))}
    </tr>
  );
}

/** Filter bar (search + dropdown) */
export function SkeletonFilterBar() {
  return (
    <div className="flex flex-col md:flex-row gap-3 p-4 rounded-lg border border-border bg-muted/10 dark:bg-gray-800/50">
      <Skeleton className="h-9 flex-1 min-w-0" />
      <Skeleton className="h-9 w-full md:w-40" />
    </div>
  );
}

/** Chart placeholder - bar chart style */
export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ height }}>
      <div className="h-full bg-muted/20 dark:bg-gray-800/20 flex items-end justify-around gap-2 p-4">
        {[40, 65, 45, 80, 55, 70, 50, 60, 35].map((h, i) => (
          <div
            key={i}
            className="flex-1 min-w-[24px] max-w-[48px] rounded-t bg-muted/80 dark:bg-gray-700/80 animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
