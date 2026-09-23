"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmployerDashboardErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function EmployerDashboardError({
  message = "We couldn't load your dashboard just now. Please try again.",
  onRetry,
}: EmployerDashboardErrorProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card
        role="alert"
        className="items-center gap-0 border-destructive/30 bg-destructive/5 p-8 text-center shadow-none"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <p className="mt-3 font-display text-sm font-semibold tracking-tight text-foreground">
          Something went wrong
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            <RotateCw />
            Try again
          </Button>
        )}
      </Card>
    </div>
  );
}
