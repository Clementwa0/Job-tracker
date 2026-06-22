import React from "react";
import { AlertCircle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AiInsightSection {
  title: string;
  items: string[];
  variant?: "default" | "success" | "warning" | "info";
}

interface AiResultPanelProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  sections?: AiInsightSection[];
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<NonNullable<AiInsightSection["variant"]>, string> = {
  default: "border-border/60 bg-muted/30",
  success: "border-emerald-500/30 bg-emerald-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  info: "border-sky-500/30 bg-sky-500/5",
};

export const AiResultPanel: React.FC<AiResultPanelProps> = ({
  title = "AI Analysis",
  loading,
  error,
  onRetry,
  sections,
  children,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn("rounded-lg border border-border/60 p-6", className)}>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Analyzing… this may take a few seconds.</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-lg border border-destructive/30 bg-destructive/5 p-4", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Analysis failed</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-3 gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!sections?.length && !children) return null;

  return (
    <div className={cn("rounded-lg border border-border/60 overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/20">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {sections?.map((section) => (
          <div
            key={section.title}
            className={cn("rounded-md border p-3", variantStyles[section.variant ?? "default"])}
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {section.title}
            </h4>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li key={i} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
};

export default AiResultPanel;
