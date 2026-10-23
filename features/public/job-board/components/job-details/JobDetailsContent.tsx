"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicJobDetail } from "@/types/jobPosting";
import { buildJobDescriptionText } from "@/lib/job-board/jobDetailsUtils";
import { JobHeader } from "./JobHeader";
import { JobMetadata } from "./JobMetadata";
import { EmailApplyNotice } from "./EmailApplyNotice";
import { DescriptionBody } from "./DescriptionBody";
import { JobSection } from "./JobSection";
import { ApplicationInstructions } from "./ApplicationInstructions";
import { CompanyDetails } from "./CompanyDetails";

export function JobDetailsContent({ job }: { job: PublicJobDetail }) {
  const [copiedJd, setCopiedJd] = useState(false);

  async function copyJobDescription() {
    try {
      await navigator.clipboard.writeText(buildJobDescriptionText(job));
      setCopiedJd(true);
      window.setTimeout(() => setCopiedJd(false), 1800);
    } catch {
      // Clipboard may be unavailable in this browser or context.
    }
  }

  return (
    <article className="rounded-xl border bg-card p-5 sm:p-7">
      <JobHeader job={job} onCopy={copyJobDescription} copied={copiedJd} />
      <JobMetadata job={job} />

      {job.category && (
        <div className="mt-3">
          <Badge variant="secondary">{job.category}</Badge>
        </div>
      )}

      <EmailApplyNotice job={job} />

      <JobSection title="About the role">
        <DescriptionBody job={job} />
      </JobSection>

      {job.applicationInstructions && (
        <JobSection title="How to apply">
          <ApplicationInstructions value={job.applicationInstructions} />
        </JobSection>
      )}

      {job.responsibilities && (
        <JobSection title="Responsibilities">
          <p className="whitespace-pre-wrap">{job.responsibilities}</p>
        </JobSection>
      )}

      {job.requirements && (
        <JobSection title="Qualifications">
          <p className="whitespace-pre-wrap">{job.requirements}</p>
        </JobSection>
      )}

      {job.tags.length > 0 && (
        <JobSection title="Skills">
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </JobSection>
      )}

      {(job.educationLevel || job.certifications) && (
        <JobSection title="Education & certifications">
          <dl className="grid gap-3 sm:grid-cols-2">
            {job.educationLevel && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Education</dt>
                <dd className="mt-0.5">{job.educationLevel}</dd>
              </div>
            )}
            {job.certifications && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Certifications</dt>
                <dd className="mt-0.5">{job.certifications}</dd>
              </div>
            )}
          </dl>
        </JobSection>
      )}

      <CompanyDetails job={job} />

      {job.source?.name && (
        <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">
          Listed on {job.source.name}.
          {job.source.url && (
            <>
              {" "}
              <a
                href={job.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View original listing
              </a>
            </>
          )}
        </p>
      )}
    </article>
  );
}
