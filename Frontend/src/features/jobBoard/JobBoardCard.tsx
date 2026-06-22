import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock, ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CompanyLogo from "@/components/pages/Jobs/CompanyLogo";
import { formatJobType, formatSalaryRange, formatWorkMode } from "@/lib/seo/formatSalary";
import type { PublicJobListItem } from "@/types/jobPosting";
import { cn } from "@/lib/utils";

interface JobBoardCardProps {
  job: PublicJobListItem;
  className?: string;
}

export default function JobBoardCard({ job, className }: JobBoardCardProps) {
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const published = job.publishedAt
    ? new Date(job.publishedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Link
      to={`/jobs/${job.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo
          name={job.company?.name || "Company"}
          logo={job.company?.logo}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {job.company?.name}
            {job.company?.industry ? ` · ${job.company.industry}` : ""}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          {formatJobType(job.jobType)}
        </span>
        <span>{formatWorkMode(job.workMode)}</span>
        {salary && <span className="font-medium text-foreground">{salary}</span>}
        {published && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {published}
          </span>
        )}
        {deadline && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Apply by {deadline}
          </span>
        )}
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
          {job.tags.length > 4 && (
            <Badge variant="outline" className="text-[10px] font-normal">
              +{job.tags.length - 4}
            </Badge>
          )}
        </div>
      )}
    </Link>
  );
}
