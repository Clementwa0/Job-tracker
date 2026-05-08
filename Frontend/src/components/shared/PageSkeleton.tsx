/**
 * @deprecated Use page-specific skeletons from '@/components/shared/skeletons' instead.
 * e.g. JobsPageSkeleton, DashboardPageSkeleton, AnalyticsPageSkeleton
 */
import { JobsPageSkeleton } from "./skeletons";

interface PageSkeletonProps {
  /** Number of card rows to show */
  rows?: number;
  /** Show table-style skeleton */
  variant?: "cards" | "table";
}

export function PageSkeleton({ rows = 4, variant = "cards" }: PageSkeletonProps) {
  return (
    <JobsPageSkeleton
      variant={variant === "table" ? "table" : "grid"}
      count={variant === "table" ? rows : rows * 2}
    />
  );
}
