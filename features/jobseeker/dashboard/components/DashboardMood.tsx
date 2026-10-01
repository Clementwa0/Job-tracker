"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Sunrise,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/features/auth/hooks/AuthContext";
import { useDashboardSummary } from "@/features/jobseeker/dashboard/hooks/useDashboardSummary";

const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      key: "morning",
      label: "Good morning",
      Icon: Sunrise,
    } as const;
  }

  if (hour < 18) {
    return {
      key: "afternoon",
      label: "Good afternoon",
      Icon: Sun,
    } as const;
  }

  return {
    key: "evening",
    label: "Good evening",
    Icon: Moon,
  } as const;
};

const DashboardMood = () => {
  const { user } = useAuth();
  const { subtitle } = useDashboardSummary();

  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "there";

  /*
   * Refresh the greeting when the time crosses
   * morning / afternoon / evening boundaries.
   */
  useEffect(() => {
    const id = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60_000);

    return () => clearInterval(id);
  }, []);

  const { label, Icon } = timeOfDay;

  const today = useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

  return (
    <header className="relative">
      {/* Ambient header glow */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          -inset-x-8
          -top-8
          h-28
          bg-gradient-to-b
          from-primary/[0.06]
          via-primary/[0.025]
          to-transparent
          blur-2xl
        "
      />

      <div
        className="
          relative
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        {/* -----------------------------------------
            LEFT — GREETING
        ----------------------------------------- */}
        <div className="min-w-0">
          {/* Date */}
          <div
            className="
              flex
              items-center
              gap-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-muted-foreground
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-md
                bg-primary/10
                text-primary
              "
            >
              <Icon className="h-3.5 w-3.5" />
            </span>

            <span>{today}</span>
          </div>

          {/* Greeting */}
          <h1
            className="
              mt-3
              font-display
              text-2xl
              font-semibold
              leading-tight
              tracking-tight
              text-foreground
              sm:text-3xl
            "
          >
            {label},{" "}
            <span
              className="
                bg-gradient-to-r
                from-primary
                to-primary/60
                bg-clip-text
                text-transparent
              "
            >
              {firstName}
            </span>
            <span className="ml-1" aria-hidden>
              👋
            </span>
          </h1>

          {/* Dashboard subtitle */}
          {subtitle && (
            <p
              className="
                mt-1.5
                max-w-2xl
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* -----------------------------------------
            RIGHT — FOCUS CHIP
        ----------------------------------------- */}
        <div
          className="
            inline-flex
            w-fit
            shrink-0
            items-center
            gap-2
            self-start
            rounded-full
            border
            border-gray-200
            bg-white
            px-3.5
            py-2
            text-xs
            font-medium
            text-gray-600
            shadow-sm

            dark:border-gray-700
            dark:bg-gray-900
            dark:text-gray-300

            sm:self-end
          "
        >
          <span
            className="
              flex
              h-6
              w-6
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
            "
          >
            <Sparkles className="h-3.5 w-3.5" />
          </span>

          <span>Here's your focus for today</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardMood;