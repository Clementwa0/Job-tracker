"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  CalendarClock,
  CircleDollarSign,
  Clock,
  Copy,
  GraduationCap,
  Mail,
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
  const [copied, setCopied] = useState(false);
  const { has, toggle } = useSavedJobs();

  useEffect(() => {
    if (slug)
      publicJobBoardService
        .get(slug)
        .then(setJob)
        .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 sm:p-8">
        <Link href="/job-board" className="text-sm text-primary">
          ← Back to jobs
        </Link>
        <p className="mt-8 text-muted-foreground">
          This job is no longer available.
        </p>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 sm:p-8">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  const salary = formatSalary(job);
  const saved = has(job.slug);
  const isClosed = job.isActive === false || job.status === "closed";
  const posted = formatDate(job.publishedAt);
  const deadline = formatDate(job.applicationDeadline);
  const deadlineSoon = daysUntil(job.applicationDeadline);

  const applyEmail =
    job.applyMethod?.type === "email" &&
    typeof job.applyMethod?.value === "string" &&
    job.applyMethod.value.length > 0
      ? job.applyMethod.value.replace(/^mailto:/i, "")
      : null;
  const isEmailApply = Boolean(applyEmail);

  const copyEmail = async () => {
    if (!applyEmail) return;
    try {
      await navigator.clipboard.writeText(applyEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — silent fail, text is still selectable */
    }
  };

  return (
    <main className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
        <Link
          href="/job-board"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All jobs
        </Link>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <article className="rounded-xl border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-primary">
                {job.company?.name || "Company"}
              </p>
              {job.company?.industry && (
                <span className="text-xs text-muted-foreground">
                  · {job.company.industry}
                </span>
              )}
              {isClosed && (
                <Badge variant="secondary" className="ml-auto">
                  Closed
                </Badge>
              )}
            </div>

            <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {job.title}
            </h1>

            {/* Meta row — added posted, deadline, category */}
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex min-w-0 items-start gap-1.5 break-words">
                <MapPin className="h-4 w-4" />
                {job.location || "Location flexible"}
              </span>
              <span className="flex min-w-0 items-start gap-1.5 break-words">
                <BriefcaseBusiness className="h-4 w-4" />
                {job.jobType.replace("-", " ")} · {job.workMode}
              </span>
              {salary && (
                <span className="flex min-w-0 items-start gap-1.5 break-words">
                  <CircleDollarSign className="h-4 w-4" />
                  {salary}
                </span>
              )}
              {job.experienceLevel && (
                <span className="flex min-w-0 items-start gap-1.5 break-words">
                  <GraduationCap className="h-4 w-4" />
                  {job.experienceLevel}
                </span>
              )}
              {posted && (
                <span className="flex min-w-0 items-start gap-1.5 break-words">
                  <Clock className="h-4 w-4" />
                  Posted {posted}
                </span>
              )}
              {deadline && (
                <span
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ${
                    isClosed
                      ? "bg-slate-100 text-slate-600"
                      : deadlineSoon !== null && deadlineSoon <= 7
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                  }`}
                >
                  <CalendarClock className="h-4 w-4" />

                  {isClosed
                    ? `Closed ${deadline}`
                    : deadlineSoon !== null && deadlineSoon <= 7
                      ? `Deadline: ${deadline} (${
                          deadlineSoon === 0
                            ? "today"
                            : deadlineSoon === 1
                              ? "tomorrow"
                              : `${deadlineSoon} days left`
                        })`
                      : `Apply by ${deadline}`}
                </span>
              )}
            </div>

            {job.category && (
              <div className="mt-3">
                <Badge variant="secondary">{job.category}</Badge>
              </div>
            )}
            {/* Inline email callout — visible at the top for email-apply jobs */}
            {applyEmail && (
              <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="text-[13px] text-slate-700">
                  Apply by email to{" "}
                  <span className="font-semibold text-blue-700">
                    {applyEmail}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyEmail}
                  className="ml-auto h-7 gap-1 px-2 text-[11px] font-medium text-blue-700 hover:bg-blue-100/60"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </Button>
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
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {(job.educationLevel || job.certifications) && (
              <Section title="Education & certifications">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {job.educationLevel && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Education
                      </dt>
                      <dd className="mt-0.5">{job.educationLevel}</dd>
                    </div>
                  )}
                  {job.certifications && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Certifications
                      </dt>
                      <dd className="mt-0.5">{job.certifications}</dd>
                    </div>
                  )}
                </dl>
              </Section>
            )}

            <Section title={`About ${job.company?.name || "the company"}`}>
              <p>
                {job.company?.description ||
                  "Learn more about this company through its website and job application."}
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                {job.company?.location && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Headquarters
                    </dt>
                    <dd className="mt-0.5">{job.company.location}</dd>
                  </div>
                )}
                {job.company?.industry && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Industry
                    </dt>
                    <dd className="mt-0.5">{job.company.industry}</dd>
                  </div>
                )}
              </dl>
              {job.company?.website && (
                <a
                  className="mt-3 inline-block text-sm text-primary hover:underline"
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
            {/* Closed banner (applies to any apply method) */}
            {isClosed && (
              <div className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[12px] text-slate-500">
                Applications closed
                {deadline ? ` on ${deadline}` : ""}.
              </div>
            )}

            {/* Non-email apply: primary CTA */}
            {!isEmailApply && (
              <Button
                className="w-full"
                disabled={isClosed}
                onClick={() => executeApply(job.applyMethod, job.title)}
              >
                <Send />
                {isClosed ? "Applications closed" : "Apply on employer site"}
              </Button>
            )}

            {/* Email apply + active: plain email + copy button */}
            {applyEmail && !isClosed && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                  <Mail className="h-3.5 w-3.5" />
                  Apply via email
                </div>

                <p className="mt-1.5 select-all break-all text-[13px] font-semibold text-blue-700">
                  {applyEmail}
                </p>

                <div className="mt-2.5 border-t border-blue-200/60 pt-2 text-[11px] leading-relaxed text-blue-900/80">
                  Please send your{" "}
                  <strong className="font-medium text-blue-950">CV</strong> and{" "}
                  <strong className="font-medium text-blue-950">
                    cover letter
                  </strong>{" "}
                  directly to this address.
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyEmail}
                  className="mt-3 h-8 w-full gap-1 bg-white text-[11px] font-medium hover:bg-blue-50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied to clipboard" : "Copy email address"}
                </Button>
              </div>
            )}

            {/* Deadline reminder */}
            {deadline &&
              !isClosed &&
              deadlineSoon !== null &&
              deadlineSoon <= 7 && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
                  <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-amber-700">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Deadline
                  </div>
                  <p className="mt-1">
                    {deadlineSoon === 0
                      ? "Applications close today."
                      : deadlineSoon === 1
                        ? "Applications close tomorrow."
                        : `Applications close in ${deadlineSoon} days (${deadline}).`}
                  </p>
                </div>
              )}

            <Button
              variant="outline"
              className="mt-3 w-full"
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

            <AddToTrackerButton
              job={job}
              className="mt-3 w-full"
              size="default"
            />

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Applications are handled directly by the employer. JobTrail does
              not manage candidate applications.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------ helpers ------------------------------ */

function formatSalary(job: PublicJobDetail) {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "KES";
  const min = job.salaryMin?.toLocaleString();
  const max = job.salaryMax?.toLocaleString();
  if (min && max) return `${currency} ${min} – ${max}`;
  return `${currency} ${min || max}${min ? "+" : ""}`;
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Whole days between now and the given ISO date.
 * Returns null when the date is missing/invalid.
 * 0 = today, negative = already passed.
 */
function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(target);
  startOfTarget.setHours(0, 0, 0, 0);
  return Math.round(
    (startOfTarget.getTime() - startOfToday.getTime()) / 86_400_000,
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
