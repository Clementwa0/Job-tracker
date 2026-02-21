import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    /** Enable subtle shimmer animation */
    shimmer?: boolean;
  }
>(({ className, shimmer = true, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="skeleton"
    className={cn(
      "rounded-md bg-muted/80 dark:bg-gray-700/80",
      shimmer && "animate-pulse",
      className
    )}
    aria-hidden
    {...props}
  />
));

Skeleton.displayName = "Skeleton";

export { Skeleton };
