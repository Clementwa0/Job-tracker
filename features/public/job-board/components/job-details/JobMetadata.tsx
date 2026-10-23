import {
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  Clock,
  GraduationCap,
  MapPin,
} from "lucide-react";
import type { PublicJobDetail } from "@/types/jobPosting";
import { formatSalary, formatDate, daysUntil } from "@/lib/job-board/jobDetailsUtils";  

export function JobMetadata({ job }: { job: PublicJobDetail }) {
  const salary = formatSalary(job);
  const isClosed = job.isActive === false || job.status === "closed";
  const posted = formatDate(job.publishedAt);
  const deadline = formatDate(job.applicationDeadline);
  const deadlineSoon = daysUntil(job.applicationDeadline);

  return (
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
      <span className="flex min-w-0 items-start gap-1.5 break-words">
        <MapPin className="h-4 w-4" />{job.location || "Location flexible"}
      </span>
      <span className="flex min-w-0 items-start gap-1.5 break-words">
        <BriefcaseBusiness className="h-4 w-4" />
        {[job.jobType.replace("-", " "), job.workMode].filter(Boolean).join(" · ")}
      </span>
      {salary && <span className="flex min-w-0 items-start gap-1.5 break-words"><CircleDollarSign className="h-4 w-4" />{salary}</span>}
      {job.experienceLevel && <span className="flex min-w-0 items-start gap-1.5 break-words"><GraduationCap className="h-4 w-4" />{job.experienceLevel}</span>}
      {posted && <span className="flex min-w-0 items-start gap-1.5 break-words"><Clock className="h-4 w-4" />Posted {posted}</span>}
      {deadline && (
        <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ${
          isClosed
            ? "bg-muted text-muted-foreground"
            : deadlineSoon !== null && deadlineSoon <= 7
              ? "border border-destructive/30 bg-destructive/10 text-destructive"
              : "border border-warning/30 bg-warning/10 text-warning-foreground"
        }`}>
          <CalendarClock className="h-4 w-4" />
          {isClosed
            ? `Closed ${deadline}`
            : deadlineSoon !== null && deadlineSoon <= 7
              ? `Deadline: ${deadline} (${deadlineSoon === 0 ? "today" : deadlineSoon === 1 ? "tomorrow" : `${deadlineSoon} days left`})`
              : `Apply by ${deadline}`}
        </span>
      )}
    </div>
  );
}
