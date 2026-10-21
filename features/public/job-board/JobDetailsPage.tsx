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
  ExternalLink,
  Clock,
  Copy,
  Check,
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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedJd, setCopiedJd] = useState(false);
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
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const copyJobDescription = async () => {
    try {
      await navigator.clipboard.writeText(buildJobDescriptionText(job));
      setCopiedJd(true);
      window.setTimeout(() => setCopiedJd(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const serif = "font-[family-name:var(--font-classic)]";
  const initial = (job.company?.name || "J").charAt(0).toUpperCase();
  const jobTypeLabel = [job.jobType?.replace("-", " "), job.workMode].filter(Boolean).join(" · ");
  const deadlineUrgent = !isClosed && deadlineSoon !== null && deadlineSoon <= 7;
  const deadlineLabel =
    deadlineSoon === 0 ? "today" : deadlineSoon === 1 ? "tomorrow" : `${deadlineSoon} days left`;

  const facts = [
    { label: "Salary", value: salary, icon: CircleDollarSign },
    { label: "Experience", value: job.experienceLevel, icon: GraduationCap },
    { label: "Posted", value: posted, icon: Clock },
    {
      label: isClosed ? "Closed" : "Apply by",
      value: deadline ? (deadlineUrgent ? `${deadline} (${deadlineLabel})` : deadline) : null,
      icon: CalendarClock,
      urgent: deadlineUrgent,
    },
  ].filter((fact) => fact.value);

  const applyButton = !isEmailApply && (
    <Button
      size="lg"
      className="h-11 w-full text-sm font-semibold"
      disabled={isClosed}
      onClick={() =>
        executeApply(job.applyMethod, job.title, { subject: job.applyEmailSubject })
      }
    >
      <Send />
      {isClosed
        ? "Applications closed"
        : job.applyViaAggregator
          ? `Apply via ${job.source?.name || "job board"}`
          : "Apply on employer site"}
    </Button>
  );

  return (
    <main className="min-h-screen bg-muted/30 pb-28 lg:pb-14">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/job-board"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          All jobs
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* ------------------------------ Header ------------------------------ */}
            <header className="border-b bg-gradient-to-b from-primary/[0.06] to-transparent px-5 pb-6 pt-6 sm:px-9 sm:pt-8">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className={`flex size-14 shrink-0 items-center justify-center rounded-xl border bg-background text-2xl font-semibold text-primary shadow-sm ${serif}`}
                >
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {job.company?.name || "Company"}
                  </p>
                  {job.company?.industry && (
                    <p className="truncate text-xs text-muted-foreground">{job.company.industry}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isClosed && <Badge variant="secondary">Closed</Badge>}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyJobDescription}
                    aria-label="Copy job description"
                    title="Copy job description"
                    className="h-8 gap-1.5 bg-background px-2.5 text-xs font-medium"
                  >
                    {copiedJd ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{copiedJd ? "Copied" : "Copy JD"}</span>
                  </Button>
                </div>
              </div>

              <h1
                className={`mt-5 break-words text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl ${serif}`}
              >
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {job.location || "Location flexible"}
                </span>
                {jobTypeLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 capitalize text-foreground/80">
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                    {jobTypeLabel}
                  </span>
                )}
                {job.category && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                    {job.category}
                  </span>
                )}
              </div>
            </header>

            {/* ---------------------------- Key facts ----------------------------- */}
            {facts.length > 0 && (
              <dl
                className={`grid grid-cols-2 divide-x divide-y border-b sm:divide-y-0 ${
                  facts.length >= 4 ? "sm:grid-cols-4" : facts.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
                }`}
              >
                {facts.map(({ label, value, icon: Icon, urgent }) => (
                  <div key={label} className="px-5 py-4 sm:px-6">
                    <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </dt>
                    <dd
                      className={`mt-1 break-words text-sm font-semibold ${
                        urgent ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="px-5 pb-8 pt-2 sm:px-9">
              {applyEmail && (
                <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-info/20 bg-info/10 px-4 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-info" />
                  <span className="min-w-0 break-words text-[13px] text-foreground">
                    Apply by email to{" "}
                    <span className="font-semibold text-info">{applyEmail}</span>
                    {job.applyEmailSubject && (
                      <>
                        {" "}with the subject{" "}
                        <span className="font-semibold text-info">{job.applyEmailSubject}</span>
                      </>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyEmail}
                    className="ml-auto h-7 gap-1 px-2 text-[11px] font-medium text-info hover:bg-info/15"
                  >
                    {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedEmail ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}

              <Section title="About the role" serif={serif} first>
                <DescriptionBody job={job} />
              </Section>

              {job.applicationInstructions && (
                <Section title="How to apply" serif={serif}>
                  <p className="whitespace-pre-line break-words">{job.applicationInstructions}</p>
                </Section>
              )}

              {job.responsibilities &&
                !hasDescriptionHeading(
                  job.descriptionSections,
                  /responsibilit|duties|what you.?ll do|key tasks/i,
                ) && (
                  <Section title="Responsibilities" serif={serif}>
                    <TextBlock text={job.responsibilities} />
                  </Section>
                )}

              {job.requirements &&
                !hasDescriptionHeading(
                  job.descriptionSections,
                  /requirements?|qualifications?|person specification|what you.?ll need|skills and experience/i,
                ) && (
                  <Section title="Qualifications" serif={serif}>
                    <TextBlock text={job.requirements} />
                  </Section>
                )}

              {job.tags.length > 0 && (
                <Section title="Skills" serif={serif}>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {(job.educationLevel || job.certifications) && (
                <Section title="Education & certifications" serif={serif}>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {job.educationLevel && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Education
                        </dt>
                        <dd className="mt-1 text-foreground/80">{job.educationLevel}</dd>
                      </div>
                    )}
                    {job.certifications && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Certifications
                        </dt>
                        <dd className="mt-1 text-foreground/80">{job.certifications}</dd>
                      </div>
                    )}
                  </dl>
                </Section>
              )}

              <Section title={`About ${job.company?.name || "the company"}`} serif={serif}>
                <p>
                  {job.company?.description ||
                    "Learn more about this company through its website and job application."}
                </p>
                {(job.company?.location || job.company?.industry) && (
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {job.company?.location && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Headquarters
                        </dt>
                        <dd className="mt-1 text-foreground/80">{job.company.location}</dd>
                      </div>
                    )}
                    {job.company?.industry && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          Industry
                        </dt>
                        <dd className="mt-1 text-foreground/80">{job.company.industry}</dd>
                      </div>
                    )}
                  </dl>
                )}
                {job.company?.website && (
                  <a
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit company website
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </Section>

              {job.source?.name && (
                <p className="mt-10 border-t pt-4 text-xs text-muted-foreground">
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
            </div>
          </article>

          {/* ------------------------------ Sidebar ------------------------------ */}
          <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-6">
            {isClosed && (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3 text-center text-[12px] text-muted-foreground">
                Applications closed{deadline ? ` on ${deadline}` : ""}.
              </div>
            )}

            {applyButton}

            {!isEmailApply && job.applyViaAggregator && !isClosed && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                This link opens {job.source?.name || "the job board"}, which forwards you to the
                employer.
              </p>
            )}

            {applyEmail && !isClosed && (
              <div className="rounded-xl border border-info/20 bg-info/10 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-info">
                  <Mail className="h-3.5 w-3.5" />
                  Apply via email
                </div>
                <p className="mt-1.5 select-all break-all text-[13px] font-semibold text-info">
                  {applyEmail}
                </p>
                <div className="mt-2.5 border-t border-info/20 pt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Please send your application and cover letter directly to this address.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyEmail}
                  className="mt-3 h-8 w-full gap-1 bg-background text-[11px] font-medium hover:bg-muted"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedEmail ? "Copied to clipboard" : "Copy email address"}
                </Button>
              </div>
            )}

            {deadlineUrgent && (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-[11px] leading-relaxed text-warning-foreground">
                <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
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

            <div className="grid gap-2 border-t pt-3">
              <Button
                variant="outline"
                className="w-full"
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

              <AddToTrackerButton job={job} className="w-full" size="default" />
            </div>

            <p className="pt-1 text-xs leading-5 text-muted-foreground">
              Applications are handled directly by the employer. JobTrail does not manage candidate
              applications.
            </p>
          </aside>
        </div>
      </div>

      {/* Mobile: keep the primary action within thumb reach */}
      {applyButton && !isClosed && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto max-w-6xl">{applyButton}</div>
        </div>
      )}
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
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

function hasDescriptionHeading(
  sections: PublicJobDetail["descriptionSections"],
  pattern: RegExp,
): boolean {
  return Boolean(sections?.some((section) => section.heading && pattern.test(section.heading)));
}

/**
 * Renders structured description sections when the posting has them
 * (ingested listings), otherwise the plain-text description.
 */
function DescriptionBody({ job }: { job: PublicJobDetail }) {
  const sections = job.descriptionSections;

  if (!sections || sections.length === 0) {
    return job.description.trim() ? (
      <p className="whitespace-pre-wrap">{job.description}</p>
    ) : (
      <p>The employer has not provided a description.</p>
    );
  }

  return (
    <div className="space-y-5">
      {sections.map((section, index) => {
        const hasBody =
          section.paragraphs.length > 0 || section.lists.length > 0;

        return (
          <div key={`${section.heading ?? "intro"}-${index}`}>
            {section.heading && (
              <h3
                className={
                  hasBody
                    ? "mb-2 text-[15px] font-semibold text-foreground"
                    : "mt-2 text-base font-semibold text-foreground"
                }
              >
                {section.heading}
              </h3>
            )}
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-3 break-words">
                {paragraph}
              </p>
            ))}
            {section.lists.map((list, i) => (
              <ul key={i} className="mb-3 list-disc space-y-2 pl-5 marker:text-primary">
                {list.items.map((item, j) => (
                  <li key={j} className="break-words">
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Section({
  title,
  serif,
  first,
  children,
}: {
  title: string;
  serif: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "mt-8" : "mt-10 border-t pt-8"}>
      <h2 className={`flex items-center gap-3 text-xl font-semibold tracking-tight text-foreground ${serif}`}>
        <span aria-hidden className="h-5 w-1 rounded-full bg-primary" />
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-7 text-foreground/75">{children}</div>
    </section>
  );
}

/**
 * Plain-text blocks (responsibilities / qualifications) arrive as one string.
 * When it is a list of short lines, render real bullets; otherwise keep the prose as written.
 */
function TextBlock({ text }: { text: string }) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-•*·–]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);

  if (lines.length < 2 || lines.some((line) => line.length > 220)) {
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-primary">
      {lines.map((line, index) => (
        <li key={index} className="break-words pl-1">
          {line}
        </li>
      ))}
    </ul>
  );
}

function buildJobDescriptionText(job: PublicJobDetail): string {
  const lines: string[] = [];
  const push = (label: string, value?: string | null) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  lines.push(job.title, job.company?.name || "Company", "");

  const metadata: string[] = [];
  if (job.location?.trim()) metadata.push(`Location: ${job.location.trim()}`);
  if (job.jobType || job.workMode) {
    metadata.push(
      `Type: ${[job.jobType?.replace(/-/g, " "), job.workMode]
        .filter(Boolean)
        .join(" · ")}`,
    );
  }
  const salary = formatSalary(job);
  if (salary) metadata.push(`Salary: ${salary}`);
  if (job.experienceLevel) metadata.push(`Experience: ${job.experienceLevel}`);
  if (job.category) metadata.push(`Category: ${job.category}`);
  const posted = formatDate(job.publishedAt);
  if (posted) metadata.push(`Posted: ${posted}`);
  const deadline = formatDate(job.applicationDeadline);
  if (deadline) metadata.push(`Application deadline: ${deadline}`);
  if (metadata.length) lines.push(metadata.join("\n"));

  const email =
    job.applyMethod?.type === "email" &&
    typeof job.applyMethod?.value === "string"
      ? job.applyMethod.value.replace(/^mailto:/i, "")
      : null;
  if (email) push("Apply via email", email);
  if (job.company?.website) push("Company website", job.company.website);

  const section = (title: string, body?: string | null) => {
    if (!body || !body.trim()) return;
    lines.push("", title.toUpperCase(), "", body.trim());
  };

  // The description contains the source's ordered sections. Add dedicated
  // fields only when the source didn't already provide those headings.
  section("About the role", job.description);
  if (!hasDescriptionHeading(job.descriptionSections, /responsibilit|duties|what you.?ll do|key tasks/i)) {
    section("Responsibilities", job.responsibilities);
  }
  if (!hasDescriptionHeading(job.descriptionSections, /requirements?|qualifications?|person specification|what you.?ll need|skills and experience/i)) {
    section("Qualifications", job.requirements);
  }
  section("How to apply", job.applicationInstructions);

  if (job.tags?.length) section("Skills", job.tags.join(" · "));

  if (job.educationLevel || job.certifications) {
    const education: string[] = [];
    if (job.educationLevel) education.push(`Education: ${job.educationLevel}`);
    if (job.certifications) education.push(`Certifications: ${job.certifications}`);
    section("Education & certifications", education.join("\n"));
  }

  if (job.company?.description || job.company?.location || job.company?.industry) {
    const companyInfo: string[] = [];
    if (job.company?.description) companyInfo.push(job.company.description.trim());
    if (job.company?.location) companyInfo.push(`Headquarters: ${job.company.location}`);
    if (job.company?.industry) companyInfo.push(`Industry: ${job.company.industry}`);
    section(`About ${(job.company?.name || "the company").toUpperCase()}`, companyInfo.join("\n"));
  }

  lines.push("", `Source: JobTrail · /job-board/${job.slug}`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}