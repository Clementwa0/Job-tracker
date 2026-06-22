import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useJobs } from "@/hooks/JobContext";
import { Building2, MapPin, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { applicationStatusColors, type ApplicationStatus } from "@/types/job";

const timeAgo = (date: string | Date) => {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const RecentApplications = () => {
  const { jobs } = useJobs();
  const recent = useMemo(
    () => [...jobs].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()).slice(0, 5),
    [jobs]
  );

  return (
    <Card className="p-5 md:p-6 border-border/60 bg-card/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent applications</h2>
        <Link to="/applications" className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">No applications yet</p>
          <Link to="/applications/add" className="mt-2 inline-block text-sm text-primary font-medium hover:underline">
            Add your first one →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {recent.map((job) => {
            const color = applicationStatusColors[job.applicationStatus as ApplicationStatus] || "bg-muted text-foreground";
            return (
              <li
                key={job.id}
                className="py-3 flex items-center gap-3 group"
              >
                <Avatar className="h-10 w-10 rounded-xl ring-1 ring-border/60">
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold">
                    {job.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{job.jobTitle}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.companyName}</span>
                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${color} text-[10px] uppercase tracking-wide px-2 py-0.5`}>
                    {job.applicationStatus}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(job.applicationDate)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default RecentApplications;
