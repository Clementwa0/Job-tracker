"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useDashboardSummary } from "@/features/jobseeker/dashboard/hooks/useDashboardSummary";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const DashboardMood = () => {
  const { user } = useAuth();
  const { subtitle } = useDashboardSummary();
  const [greeting, setGreeting] = useState(getGreeting);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";

  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(timer);
  }, []);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {greeting}, {firstName}! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {today}
      </div>
    </div>
  );
};

export default DashboardMood;