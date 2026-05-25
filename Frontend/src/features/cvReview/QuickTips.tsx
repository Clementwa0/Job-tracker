import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export const QuickTips: React.FC = () => {
  return (
    <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          Quick Improvement Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              ✓ Use Action Verbs
            </h4>
            <p className="text-sm text-muted-foreground">
              Start bullet points with strong action verbs like "Led", "Managed", "Increased"
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              ✓ Quantify Achievements
            </h4>
            <p className="text-sm text-muted-foreground">
              Include numbers and metrics to show impact (e.g., "Increased sales by 25%")
            </p>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              ✓ Keywords Optimization
            </h4>
            <p className="text-sm text-muted-foreground">
              Include relevant keywords from job descriptions to improve ATS matching
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};