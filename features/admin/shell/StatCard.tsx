import type { LucideIcon } from "lucide-react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  accent?: "default" | "blue" | "green" | "amber" | "violet";
}

/** Restrained, single-tone icon treatment — no gradients or heavy fills. */
const ICON_TONE: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-muted text-muted-foreground",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel = "this month",
  accent = "default",
}: StatCardProps) {
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <Card size="sm" className="h-full gap-2">
      <CardContent className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <span
          aria-hidden
          className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", ICON_TONE[accent])}
        >
          <Icon className="size-3.5" />
        </span>
      </CardContent>
      <CardContent>
        <p className="font-heading text-2xl font-semibold tabular-nums tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 flex min-h-4 items-center gap-1 text-xs">
          {trend !== undefined ? (
            <span
              className={cn(
                "flex items-center gap-1 font-medium tabular-nums",
                trend > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trend < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-muted-foreground",
              )}
            >
              <TrendIcon className="size-3 shrink-0" />
              {trend > 0 ? "+" : ""}
              {trend.toLocaleString()}
              <span className="font-normal text-muted-foreground">{trendLabel}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{description}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
