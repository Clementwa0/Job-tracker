"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  CircleDollarSign,
  GraduationCap,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executeApply } from "@/lib/job-board/applyActions";
import { useSavedJobs } from "@/lib/savedJobs";
import AddToTrackerButton from "./components/AddToTrackerButton";
import { publicJobBoardService } from "./services/publicJobBoard.client";
import type { PublicJobDetail } from "@/types/jobPosting";

export default function JobDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<PublicJobDetail | null>(null);
  const [error, setError] = useState(false);
  const { has, toggle } = useSavedJobs();

  useEffect(() => {
    if (slug) publicJobBoardService.get(slug).then(setJob).catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <Link href="/job-board" className="text-sm text-primary">← Back to jobs</Link>
        <p className="mt-8 text-muted-foreground">This job is no longer available.</p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  const salary = formatSalary(job);
  const saved = has(job.slug);

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <Link href="/job-board" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" />
          All jobs
        </Link>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <article className="rounded-xl border bg-card p-5 sm:p-7">
            <p className="text-sm font-medium text-primary">{job.company?.name || "Company"}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{job.title}</h1>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location || "Location flexible"}
              </span>
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness className="h-4 w-4" />
                {job.jobType.replace("-", " ")} · {job.workMode}
              </span>
              {salary && (
                <span className="flex items-center gap-1.5">
                  <CircleDollarSign className="h-4 w-4" />
                  {salary}
                </span>
              )}
              {job.experienceLevel && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {job.experienceLevel}
                </span>
              )}
            </div>

            {job.category && (
              <div className="mt-3">
                <Badge variant="secondary">{job.category}</Badge>
              </div>
            )}

            <Section title="About the role">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </Section>

            {job.responsibilities && (
              <Section title="Responsibilities">
                <p className="whitespace-pre-wrap">{job.responsibilities}</p>
              </Section>
            )}

            {job.requirements && (
              <Section title="Qualifications">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </Section>
            )}

            {job.tags.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </Section>
            )}

            {(job.educationLevel || job.certifications) && (
              <Section title="Education & certifications">
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
              </Section>
            )}

            <Section title={`About ${job.company?.name || "the company"}`}>
              <p>{job.company?.description || "Learn more about this company through its website and job application."}</p>
              {job.company?.website && (
                <a
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit company website
                </a>
              )}
            </Section>
          </article>

          <aside className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-6">
            <Button className="w-full" disabled={!job.isActive} onClick={() => executeApply(job.applyMethod, job.title)}>
              <Send />
              {job.isActive ? "Apply on employer site" : "Applications closed"}
            </Button>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() =>
                toggle({
                  slug: job.slug,
                  title: job.title,
                  company: job.company?.name || "Company",
                  location: job.location,
                  salary: salary || undefined,
                })
              }
            >
              <Bookmark className={saved ? "fill-current" : ""} />
              {saved ? "Saved" : "Save job"}
            </Button>
            <AddToTrackerButton job={job} className="mt-2 w-full" size="default" />
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Applications are handled directly by the employer. JobTrail does not manage candidate applications.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatSalary(job: PublicJobDetail) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "KES";
  const min = job.salaryMin?.toLocaleString();
  const max = job.salaryMax?.toLocaleString();
  if (min && max) return `${currency} ${min} – ${max}`;
  return `${currency} ${min || max}${min ? "+" : ""}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
