import { TrendingDown, TrendingUp } from "lucide-react";
import type { TrendCounts } from "@/types/admin";
import { cn } from "@/lib/utils";

function formatTrend(value: number, label: string) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value} ${label}`;
}

export function TrendIndicator({ trends }: { trends: TrendCounts }) {
  return (
    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
      <TrendLine value={trends.month} label="this month" />
      <TrendLine value={trends.week} label="this week" />
      <TrendLine value={trends.today} label="today" />
    </div>
  );
}

function TrendLine({ value, label }: { value: number; label: string }) {
  const positive = value >= 0;
  return (
    <div className={cn("flex items-center gap-1", positive ? "text-emerald-600" : "text-rose-600")}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>{formatTrend(value, label)}</span>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number;
  trends?: TrendCounts;
  icon?: React.ElementType;
}

export function KpiCard({ label, value, trends, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
      {trends && <TrendIndicator trends={trends} />}
    </div>
  );
}
