import React from "react";
import { cn } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

type Color =
  | "blue"
  | "amber"
  | "purple"
  | "green"
  | "red";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: Color;
  trend?: number;
};

const palette: Record<
  Color,
  {
    icon: string;
    ring: string;
    glow: string;
  }
> = {
  blue: {
    icon: "text-blue-500",
    ring: "ring-blue-500/10",
    glow: "from-blue-500/10",
  },

  amber: {
    icon: "text-amber-500",
    ring: "ring-amber-500/10",
    glow: "from-amber-500/10",
  },

  purple: {
    icon: "text-purple-500",
    ring: "ring-purple-500/10",
    glow: "from-purple-500/10",
  },

  green: {
    icon: "text-emerald-500",
    ring: "ring-emerald-500/10",
    glow: "from-emerald-500/10",
  },

  red: {
    icon: "text-red-500",
    ring: "ring-red-500/10",
    glow: "from-red-500/10",
  },
};

const StatCard = ({
  icon,
  label,
  value,
  color,
  trend,
}: Props) => {
  const p = palette[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "border border-border/60 bg-card/70 p-5",
        "backdrop-blur-xl shadow-sm",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg",
        "ring-1",
        p.ring
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          "bg-gradient-to-br to-transparent opacity-0",
          "transition-opacity duration-300",
          "group-hover:opacity-100",
          p.glow
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

          <h3 className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </h3>

          {typeof trend === "number" && (
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                trend >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-500 dark:text-red-400"
              )}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}

              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            "border border-border/60 bg-background/70",
            "shadow-sm",
            p.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;