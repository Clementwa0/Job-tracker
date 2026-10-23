import type { PublicJobDetail } from "@/types/jobPosting";
import { JobSection } from "./JobSection";

export function CompanyDetails({ job }: { job: PublicJobDetail }) {
  return (
    <JobSection title={`About ${job.company?.name || "the company"}`}>
      <p>
        {job.company?.description || "Learn more about this company through its website and job application."}
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        {job.company?.location && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Headquarters</dt>
            <dd className="mt-0.5">{job.company.location}</dd>
          </div>
        )}
        {job.company?.industry && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Industry</dt>
            <dd className="mt-0.5">{job.company.industry}</dd>
          </div>
        )}
      </dl>
      {job.company?.website && (
        <a className="mt-3 inline-block text-sm text-primary hover:underline" href={job.company.website} target="_blank" rel="noreferrer">
          Visit company website
        </a>
      )}
    </JobSection>
  );
}
