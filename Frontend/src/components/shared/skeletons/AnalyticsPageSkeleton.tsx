import { SkeletonHeader, SkeletonStatCard, SkeletonChart } from "./SkeletonPrimitives";

export function AnalyticsPageSkeleton() {
  return (
    <div
      className="min-h-screen p-6 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading analytics"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <SkeletonHeader hasSubtitle={false} hasAction={false} />

        {/* Stats row - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-lg bg-muted/30 dark:bg-gray-800/30 w-full max-w-md">
          {["Overview", "Companies", "Locations", "Timeline"].map((_, i) => (
            <div
              key={i}
              className="h-9 flex-1 rounded-md bg-muted/80 animate-pulse"
            />
          ))}
        </div>

        {/* Charts area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card dark:bg-gray-800/50 p-6">
            <div className="h-5 w-48 rounded bg-muted/80 animate-pulse mb-4" />
            <SkeletonChart height={300} />
          </div>
          <div className="rounded-xl border border-border bg-card dark:bg-gray-800/50 p-6">
            <div className="h-5 w-40 rounded bg-muted/80 animate-pulse mb-4" />
            <SkeletonChart height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}
