import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the shape of the loaded dashboard so nothing jumps on resolve. */
export default function EmployerDashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard…</span>

      {/* Welcome / company context */}
      <Card className="border-border p-4 shadow-none sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
      </Card>

      {/* Job statistics */}
      <section>
        <Skeleton className="mb-3 h-3.5 w-28" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="gap-0 rounded-xl border-border p-4 shadow-none">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="mt-2.5 h-5 w-10" />
            </Card>
          ))}
        </div>
      </section>

      {/* My job postings */}
      <Card className="border-border p-4 shadow-none">
        <div className="mb-2.5 flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="hidden h-3.5 w-16 sm:block" />
              <Skeleton className="hidden h-3.5 w-20 sm:block" />
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      </Card>

      {/* Quick actions */}
      <Card className="border-border p-4 shadow-none">
        <Skeleton className="mb-3 h-3.5 w-24" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-9 w-full rounded-lg sm:w-40" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-44" />
        </div>
      </Card>
    </div>
  );
}
