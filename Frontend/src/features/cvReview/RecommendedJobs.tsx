import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface RecommendedJobsProps {
  recommendedJobsText?: string;
}

export const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ recommendedJobsText }) => {
  if (!recommendedJobsText) return null;

  const jobs = recommendedJobsText
    .split("\n")
    .filter((job) => job.trim())
    .map((job) => job.replace(/^[•\-*\s]+/, "").trim());

  if (jobs.length === 0) return null;

  return (
    <Card className="shadow-xl border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Recommended Job Opportunities
        </CardTitle>
        <CardDescription>
          Based on your CV analysis, here are roles that match your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.slice(0, 6).map((job, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {job}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on your skills and experience
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