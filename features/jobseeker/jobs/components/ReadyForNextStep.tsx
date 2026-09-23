"use client";

import Link from "next/link";
import { Rocket, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const ReadyForNextStep = () => (
  <Card className="border-border bg-card p-4 shadow-none">
    <div className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Rocket className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Ready for the next step?
        </h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          Explore more opportunities that match your skills.
        </p>
      </div>
    </div>

    <Link
      href="/job-board"
      className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Browse Jobs
      <ArrowRight className="h-3 w-3" />
    </Link>
  </Card>
);

export default ReadyForNextStep;