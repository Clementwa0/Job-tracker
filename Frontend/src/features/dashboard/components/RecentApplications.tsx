import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useJobs } from "@/hooks/JobContext";
import { Building2, MapPin } from "lucide-react";
import { useMemo } from "react";
import { applicationStatusColors, type ApplicationStatus } from "@/types/job";

const RecentApplications = () => {
  const { jobs } = useJobs();

  const recent = useMemo(() => {
    return [...jobs]
      .sort(
        (b, a) =>
          new Date(a.applicationDate).getTime() -
          new Date(b.applicationDate).getTime()
      )
      .slice(0, 5);
  }, [jobs]);

  const getStatusColor = (status: string): string => {
    return (
      applicationStatusColors[status as ApplicationStatus] ||
      "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    );
  };

  return (
    <Card className="p-4 sm:p-6 w-full">
      {/* Header */}
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">
        Recent Applications
      </h2>

      <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No activity yet
          </p>
        ) : (
          recent.map((job) => (
            <li
              key={job.id}
              className="
                flex flex-col sm:flex-row sm:items-center
                gap-3 sm:gap-4
                py-3 border-b border-border last:border-none
              "
            >
              {/* Top row on mobile */}
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-muted text-xs sm:text-sm font-semibold">
                    {job.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm sm:text-base font-medium text-foreground">
                    {job.jobTitle}
                  </p>

                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.companyName}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom row on mobile / right side on desktop */}
              <div className="flex sm:flex-col sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 w-full sm:w-auto">
                <Badge
                  className={`${getStatusColor(job.applicationStatus)} text-xs px-2 py-1`}
                >
                  {job.applicationStatus}
                </Badge>

                <span className="text-xs text-muted-foreground">
                  {job.applicationDate
                    ? new Date(job.applicationDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
};

export default RecentApplications;