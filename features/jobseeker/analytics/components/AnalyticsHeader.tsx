"use client";

import { BarChart3, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PERIOD_LABELS, type Period } from "@/features/jobseeker/analytics/hooks/useAnalyticsData";

type Props = {
  period: Period;
  onPeriodChange: (period: Period) => void;
  onExport: () => void;
};

const AnalyticsHeader = ({ period, onPeriodChange, onExport }: Props) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your job search progress, measure your performance, and get insights to
            help you achieve your career goals.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
          <SelectTrigger className="w-[150px] bg-card">
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

        <Button variant="outline" size="lg" className="bg-card" onClick={onExport}>
          <Download className="h-3.5 w-3.5" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
