import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({
  size = "md",
  fullScreen = false,
  message,
  className,
}: {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  message?: string;
  className?: string;
}) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const spinner = (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizes[size],
        className
      )}
    />
  );

  // Fullscreen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm gap-3">
        {spinner}
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );
  }

  // Inline / page usage
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      {spinner}
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}