// src/components/RecommendedJobs.tsx

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Briefcase } from "lucide-react";

interface RecommendedJobsProps {
  recommendedJobsText?: string;
}

export const RecommendedJobs: React.FC<
  RecommendedJobsProps
> = ({ recommendedJobsText }) => {
  if (!recommendedJobsText) return null;

  const jobs = recommendedJobsText
    .split("\n")
    .map((job) =>
      job.replace(/^[•*\-\d.\s]+/, "").trim()
    )
    .filter(Boolean);

  if (jobs.length === 0) return null;

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />

          Recommended Job Opportunities
        </CardTitle>

        <CardDescription>
          Based on your CV analysis, here are roles
          that match your profile
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-border/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {job}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      Recommended based on your
                      skills, ATS score, and
                      experience level.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};