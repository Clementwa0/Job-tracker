import { SkeletonHeader, SkeletonFilterBar, SkeletonJobCard, SkeletonTableRow } from "./SkeletonPrimitives";

interface JobsPageSkeletonProps {
  /** View mode - determines layout */
  variant?: "table" | "grid";
  /** Number of items to show */
  count?: number;
}

export function JobsPageSkeleton({ variant = "grid", count = 8 }: JobsPageSkeletonProps) {
  return (
    <div
      className="space-y-6 min-h-screen px-4 py-6 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading jobs"
    >
      <SkeletonHeader hasSubtitle hasAction />

      <SkeletonFilterBar />

      {/* Tabs + count row */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-9 w-16 rounded-md bg-muted/80 animate-pulse" />
          <div className="h-9 w-16 rounded-md bg-muted/80 animate-pulse" />
        </div>
        <div className="h-4 w-32 rounded bg-muted/80 animate-pulse" />
      </div>

      {variant === "table" ? (
        <div className="rounded-lg border border-border overflow-hidden bg-card dark:bg-gray-800/50">
          {/* Table header */}
          <div className="flex gap-4 px-4 py-3 bg-muted/30 dark:bg-gray-900/50 border-b border-border">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded bg-muted/80 animate-pulse ${i < 8 ? "flex-1 min-w-0" : "w-20 shrink-0"}`}
              />
            ))}
          </div>
          {/* Table body */}
          <table className="w-full">
            <tbody>
              {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
                <SkeletonTableRow key={i} columns={9} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
