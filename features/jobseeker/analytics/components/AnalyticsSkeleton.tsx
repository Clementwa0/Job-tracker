import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    <Skeleton className="h-14 w-full rounded-xl" />

    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
      <div className="space-y-4 sm:space-y-6 xl:col-span-3">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="space-y-4 sm:space-y-6">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  </div>
);

export default AnalyticsSkeleton;