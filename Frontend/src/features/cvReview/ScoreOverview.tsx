import React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Target } from "lucide-react";

import type { ScoreMetrics } from "@/features/cvReview/scoreMetrics";

interface ScoreOverviewProps {
  score: number;
  scoreMetrics?: ScoreMetrics | null;
}

export const ScoreOverview: React.FC<
  ScoreOverviewProps
> = ({ score, scoreMetrics }) => {
  return (
    <Card className="lg:col-span-2 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="h-5 w-5 text-blue-600" />

          <span>ATS Compatibility Score</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <div
              className={`text-5xl sm:text-6xl font-bold tracking-tight ${
                scoreMetrics?.color || "text-blue-600"
              }`}
            >
              {score}

              <span className="ml-1 text-2xl sm:text-3xl text-muted-foreground font-medium">
                /100
              </span>
            </div>

            {scoreMetrics && (
              <Badge
                className={`px-5 py-2 text-sm sm:text-base rounded-full border ${scoreMetrics.badgeClass}`}
              >
                <span className="flex items-center gap-2">
                  {scoreMetrics.icon}

                  {scoreMetrics.label}
                </span>
              </Badge>
            )}
          </div>

          <div className="w-full max-w-xl space-y-3">
            <Progress
              value={score}
              className={`h-3 rounded-full overflow-hidden ${
                scoreMetrics?.progressClass || ""
              }`}
            />

            <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
              {[0, 25, 50, 75, 100].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>
          </div>

          <div className="text-center max-w-md">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your ATS score reflects how well your
              resume is optimized for applicant
              tracking systems and recruiter
              screening processes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};