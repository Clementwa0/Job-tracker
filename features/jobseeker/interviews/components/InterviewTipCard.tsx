"use client";

import Link from "next/link";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const InterviewTipCard = () => {
  return (
    <Card className="relative overflow-hidden border-primary/15 bg-primary/[0.05] p-5 shadow-none">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Lightbulb className="h-5 w-5" />
      </div>

      <h3 className="mt-3 font-display text-base font-semibold text-foreground">Interview Tip</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Research the company, practice common questions, and be ready to showcase your skills and experience.
      </p>

      <Link
        href="/jobseeker/cv-review"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        View Full Guide
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
};

export default InterviewTipCard;
