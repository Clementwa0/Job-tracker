import { Spinner } from "@/components/shared/LoadingSpinner";

export function RouteFallback() {
  return (
    <div className="flex items-center justify-center p-10">
      <Spinner />
    </div>
  );
}

