"use client";

import Link from "next/link";
import {
  FileUp,
  ListChecks,
  Search,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ACTIONS = [
  {
    href: "/job-board",
    label: "Browse Jobs",
    icon: Search,
  },
  {
    href: "/jobseeker/applications",
    label: "Applications",
    icon: ListChecks,
  },
  {
    href: "/jobseeker/resumes",
    label: "Upload Resume",
    icon: FileUp,
  },
  {
    href: "/jobseeker/settings",
    label: "Profile",
    icon: UserRound,
  },
];

const QuickActionsCard = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed  bottom-5 right-5 z-50 sm:bottom-7 sm:right-7"
    >
      {/* Action menu */}
      <div
        className={[
          "absolute bottom-[68px] right-0",
          "flex flex-col items-end gap-3",
          "transition-all duration-300 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        ].join(" ")}
      >
        {ACTIONS.map(({ href, label, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={[
              "group flex items-center gap-2",
              "transition-all duration-300 ease-out",
              open
                ? "translate-x-0 opacity-100"
                : "translate-x-5 opacity-0",
            ].join(" ")}
            style={{
              transitionDelay: open
                ? `${index * 45}ms`
                : `${(ACTIONS.length - index) * 25}ms`,
            }}
          >
            {/* Label */}
            <span
              className="
                whitespace-nowrap
                rounded-md
                border
                border-gray-500
                bg-blue-500
                px-3
                py-2
                text-xs
                font-medium
                text-white
                shadow-[0_4px_18px_rgba(0,0,0,0.12)]
                transition-all
                duration-200

                group-hover:border-gray-300
                group-hover:bg-gray-50

                dark:border-white/10
                dark:bg-zinc-900
                dark:text-zinc-100
                dark:shadow-black/30
                dark:group-hover:bg-zinc-800
              "
            >
              {label}
            </span>

            {/* Action button */}
            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full

                border
                border-gray-200
                bg-white
                text-gray-700

                shadow-[0_5px_20px_rgba(0,0,0,0.14)]

                transition-all
                duration-200

                group-hover:scale-105
                group-hover:border-primary
                group-hover:bg-primary
                group-hover:text-primary-foreground

                dark:border-white/10
                dark:bg-zinc-900
                dark:text-zinc-200
                dark:shadow-black/40
                dark:group-hover:border-primary
                dark:group-hover:bg-primary
                dark:group-hover:text-primary-foreground
              "
            >
              <Icon className="h-[17px] w-[17px]" />
            </span>
          </Link>
        ))}
      </div>

      {/* Main floating button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        aria-expanded={open}
        className="
          group
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full

          border
          border-primary/20
          bg-primary
          text-primary-foreground

          shadow-[0_8px_28px_rgba(0,0,0,0.18)]
          shadow-primary/20

          transition-all
          duration-300

          hover:scale-105
          hover:shadow-[0_10px_34px_rgba(0,0,0,0.22)]

          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-primary
          focus-visible:ring-offset-2

          dark:shadow-primary/20
        "
      >
        <span
          className={[
            "transition-transform duration-300",
            open ? "rotate-90" : "rotate-0",
          ].join(" ")}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Zap className="h-5 w-5" />
          )}
        </span>
      </button>
    </div>
  );
};

export default QuickActionsCard;