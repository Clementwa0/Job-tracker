"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const KeepGoingCard = () => (
  <Card className="relative overflow-hidden border-none bg-primary p-4 text-primary-foreground shadow-none">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
      <Target className="h-4 w-4" />
    </div>

    <h3 className="mt-2.5 font-display text-sm font-semibold">
      You&apos;re on the right track!
    </h3>
    <p className="mt-1 max-w-[85%] text-[11px] leading-relaxed text-primary-foreground/80">
      Stay consistent — your next opportunity is closer than you think.
    </p>

    <Link
      href="/job-board"
      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary-foreground px-3 py-2 text-[11px] font-semibold text-primary transition-opacity hover:opacity-90"
    >
      Continue Your Journey
      <ArrowRight className="h-3 w-3" />
    </Link>

    <svg
      viewBox="0 0 120 70"
      aria-hidden
      className="pointer-events-none absolute -bottom-2 -right-2 h-20 w-28 opacity-25"
    >
      <rect x="4" y="46" width="16" height="20" rx="2" fill="currentColor" />
      <rect x="26" y="34" width="16" height="32" rx="2" fill="currentColor" />
      <rect x="48" y="22" width="16" height="44" rx="2" fill="currentColor" />
      <rect x="70" y="10" width="16" height="56" rx="2" fill="currentColor" />
      <path
        d="M92 8 L104 8 L104 20"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M78 22 L92 8"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
    </svg>
  </Card>
);

export default KeepGoingCard;