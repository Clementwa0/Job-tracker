import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-32 w-full rounded-2xl" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
);

export default DashboardSkeleton;
