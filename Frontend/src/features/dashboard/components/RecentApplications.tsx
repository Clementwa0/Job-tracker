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
          new Date(b.applicationDate).getTime(),
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
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Recent Applications
      </h2>

<ul className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No activity yet</p>
        ) : (
          recent.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              {/* Avatar */}
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">
                  {job.companyName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Main info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {job.jobTitle}
                </p>

                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
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

              {/* Status + date */}
              <div className="flex flex-col items-end gap-1">
                <Badge
                  className={`${getStatusColor(job.applicationStatus)} px-2 py-1 text-xs`}
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
