import { SkeletonHeader, SkeletonStatCard, SkeletonCard } from "./SkeletonPrimitives";

export function DashboardPageSkeleton() {
  return (
    <div
      className="container mx-auto px-4 py-4 space-y-6 min-h-screen animate-in fade-in duration-200"
      role="status"
      aria-label="Loading dashboard"
    >
      <SkeletonHeader hasSubtitle={false} hasAction />

      {/* Stats grid - 5 cards */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard hasHeader lines={5} />
        <div className="space-y-6">
          <SkeletonCard hasHeader lines={3} />
          <SkeletonCard hasHeader lines={4} />
        </div>
      </div>
    </div>
  );
}
