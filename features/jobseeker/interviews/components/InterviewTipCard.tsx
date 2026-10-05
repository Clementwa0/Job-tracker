"use client";

import { Lightbulb } from "lucide-react";
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

    </Card>
  );
};

export default InterviewTipCard;
