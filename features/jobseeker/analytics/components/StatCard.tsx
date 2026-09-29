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
};

const StatCard = ({ icon, title, value, trend, tone }: Props) => (
  <Card className="gap-0 rounded-xl border-border p-3.5 shadow-none sm:p-4">
    <div className="flex items-center gap-2.5">
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
        {icon}
      </div>
      <p className="truncate text-[11px] font-medium text-muted-foreground sm:text-xs">{title}</p>
    </div>

    <div className="mt-2.5 flex items-baseline gap-1.5">
      <span className="tnum font-display text-xl font-semibold leading-none text-foreground sm:text-2xl">
        {value}
      </span>
      {typeof trend === "number" && trend !== 0 && (
        <span
          className={cn(
            "flex items-center gap-0.5 text-[11px] font-medium",
            trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          )}
        >
          {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </Card>
);

export default StatCard;