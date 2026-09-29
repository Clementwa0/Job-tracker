"use client";

import { BarChart3, Download } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PERIOD_LABELS, type Period } from "@/features/jobseeker/analytics/hooks/useAnalyticsData";

type Props = {
  period: Period;
  onPeriodChange: (period: Period) => void;
  onExport: () => void;
};

const AnalyticsHeader = ({ period, onPeriodChange, onExport }: Props) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BarChart3 className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Analytics
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Track your job search progress and performance.
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
        <SelectTrigger className="h-9 w-full bg-card sm:w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((key) => (
            <SelectItem key={key} value={key}>
              {PERIOD_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="h-9 shrink-0 bg-card" onClick={onExport}>
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  </header>
);

export default AnalyticsHeader;