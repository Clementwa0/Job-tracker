import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      aria-hidden
    />
  );
}

export function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
