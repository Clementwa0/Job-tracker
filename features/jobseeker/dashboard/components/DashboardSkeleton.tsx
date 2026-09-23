import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-16 w-full rounded-xl" />

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>

    <Skeleton className="h-32 w-full rounded-xl" />

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>

    <Skeleton className="h-28 w-full rounded-xl" />
  </div>
);

export default DashboardSkeleton;
