import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "blue" | "green" | "purple" | "amber";

const TONE_CLASSES: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  amber: "bg-gold/15 text-gold-foreground dark:text-gold",
};

type Props = {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  trend?: number;
  tone: Tone;
  footnote?: string;
};

const StatCard = ({ icon, title, value, trend, tone, footnote = "vs. previous period" }: Props) => {
  return (
    <Card className="gap-0 rounded-xl border-border p-5 shadow-none">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            TONE_CLASSES[tone]
          )}
        >
          {icon}
        </div>
        <p className="truncate text-xs font-medium text-muted-foreground">{title}</p>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="tnum font-display text-2xl font-semibold leading-none text-foreground">
          {value}
        </span>
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground">{footnote}</p>
    </Card>
  );
};

export default StatCard;
