import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TrendCounts } from "@/types/admin";
import { cn } from "@/lib/utils";

function formatDelta(value: number) {
  return `${value > 0 ? "+" : ""}${value.toLocaleString()}`;
}

function deltaTone(value: number) {
  if (value > 0) return "text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
}

function DeltaIcon({ value }: { value: number }) {
  const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
  return <Icon className="size-3 shrink-0" aria-hidden />;
}

/** Full month/week/today breakdown — used on the analytics detail views. */
export function TrendIndicator({ trends }: { trends: TrendCounts }) {
  return (
    <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {(
        [
          ["This month", trends.month],
          ["This week", trends.week],
          ["Today", trends.today],
        ] as const
      ).map(([label, value]) => (
        <div key={label} className="flex items-center gap-1">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className={cn("flex items-center gap-0.5 font-medium tabular-nums", deltaTone(value))}>
            <DeltaIcon value={value} />
            {formatDelta(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  /** When provided, the card shows a single "this month" delta to stay compact. */
  trends?: TrendCounts;
  /** Static supporting line, shown when no trend is available. */
  hint?: string;
  icon?: LucideIcon;
}

export function KpiCard({ label, value, trends, hint, icon: Icon }: KpiCardProps) {
  return (
    <Card size="sm" className="h-full gap-2">
      <CardContent className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          >
            <Icon className="size-3.5" />
          </span>
        )}
      </CardContent>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 flex min-h-4 items-center gap-1 text-xs">
          {trends ? (
            <span className={cn("flex items-center gap-1 font-medium tabular-nums", deltaTone(trends.month))}>
              <DeltaIcon value={trends.month} />
              {formatDelta(trends.month)}
              <span className="font-normal text-muted-foreground">this month</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{hint}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
