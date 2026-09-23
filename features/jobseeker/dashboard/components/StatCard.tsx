import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  icon: React.ReactNode;
  iconClass?: string;
  label: string;
  value: React.ReactNode;
  trend?: number;
  trendInverted?: boolean;
  caption?: string;
};

const StatCard = ({
  icon,
  iconClass,
  label,
  value,
  trend,
  trendInverted,
  caption = "vs previous 30 days",
}: Props) => {
  const isPositive =
    typeof trend === "number" && (trendInverted ? trend < 0 : trend >= 0);

  return (
    <Card className="gap-0 rounded-xl border-border p-4 shadow-none">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            iconClass ?? "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </div>
        <p className="truncate text-[11px] font-medium text-muted-foreground">
          {label}
        </p>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="font-display text-xl font-semibold leading-none text-foreground">
          {value}
        </span>
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="mt-1 text-[10px] text-muted-foreground">{caption}</p>
    </Card>
  );
};

export default StatCard;