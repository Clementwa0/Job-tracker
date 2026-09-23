import { Lightbulb, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Insight = {
  icon: "trending" | "target" | "lightbulb" | "shield";
  title: string;
  description: string;
};

type Props = {
  insights: Insight[];
};

const ICONS = {
  trending: TrendingUp,
  target: Sparkles,
  lightbulb: Lightbulb,
  shield: ShieldAlert,
};

const TONE: Record<Insight["icon"], string> = {
  trending: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  target: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  lightbulb: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  shield: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const KeyInsightsCard = ({ insights }: Props) => {
  return (
    <Card className="border-border p-5 shadow-none">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Key Insights
        </h2>
      </div>

      <ul className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = ICONS[insight.icon];
          return (
            <li key={i} className="flex items-start gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  TONE[insight.icon]
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-foreground">{insight.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default KeyInsightsCard;
