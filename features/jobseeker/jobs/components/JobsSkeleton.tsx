import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const JobsTableSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
    <div className="border-b border-border/70 bg-muted/40 px-3 py-2">
      <Skeleton className="h-3.5 w-20" />
    </div>
    <div className="divide-y divide-border/60">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-3">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-14" />
        </div>
      ))}
    </div>
  </div>
);

export const JobsGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-2.5 rounded-xl border border-border/70 bg-card p-3.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-16 rounded-full" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-2.5 w-2/3" />
          <Skeleton className="h-2.5 w-1/2" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      </div>
    ))}
  </div>
);