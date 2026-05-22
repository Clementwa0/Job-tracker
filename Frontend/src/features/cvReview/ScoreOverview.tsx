import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface ScoreMetrics {
  color: string;
  label: string;
  badgeClass: string;
  progressClass: string;
  icon: React.ReactNode;
}

interface ScoreOverviewProps {
  score: number;
  scoreMetrics: ScoreMetrics | null;
}

export const ScoreOverview: React.FC<ScoreOverviewProps> = ({ score, scoreMetrics }) => {
  return (
    <Card className="lg:col-span-2 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          ATS Compatibility Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`text-6xl font-bold ${scoreMetrics?.color}`}>
                {score}
                <span className="text-3xl text-muted-foreground">/100</span>
              </div>
              <Badge className={`mt-4 text-lg py-2 px-6 ${scoreMetrics?.badgeClass}`}>
                <span className="flex items-center gap-2">
                  {scoreMetrics?.icon}
                  {scoreMetrics?.label}
                </span>
              </Badge>
            </div>
            <div className="w-full max-w-md">
              <Progress value={score} className={`h-3 ${scoreMetrics?.progressClass}`} />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};