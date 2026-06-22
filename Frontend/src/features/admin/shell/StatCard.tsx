import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const ACCENT: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "from-primary/5 to-transparent border-border",
  blue: "from-blue-500/10 to-transparent border-blue-500/20",
  green: "from-emerald-500/10 to-transparent border-emerald-500/20",
  amber: "from-amber-500/10 to-transparent border-amber-500/20",
  violet: "from-violet-500/10 to-transparent border-violet-500/20",
};

const ICON_BG: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
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
  const trendUp = trend !== undefined && trend >= 0;

  return (
    <Card
      className={cn(
        "overflow-hidden border bg-gradient-to-br py-0 shadow-sm transition-shadow hover:shadow-md",
        ACCENT[accent],
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", ICON_BG[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pb-5">
        <p className="text-3xl font-bold tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {trend !== undefined && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium",
              trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
            )}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>
              {trend >= 0 ? "+" : ""}
              {trend} {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
