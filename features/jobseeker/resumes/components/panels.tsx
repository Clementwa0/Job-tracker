"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  AlertCircle,
  BriefcaseBusiness,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDebounce } from "@/hooks/useDebounce";
import { scoreResume } from "@/lib/resume/ats";
import { analyzeJobMatch, type JobMatchResult } from "@/lib/resume/jobMatch";
import type { ResumeData } from "@/lib/resume/types";

function Ring({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const tone =
    value >= 80
      ? "text-success"
      : value >= 60
        ? "text-warning"
        : "text-destructive";
  return (
    <div className="flex items-center gap-4">
      <div className={`relative grid size-24 place-items-center ${tone}`}>
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${value} 100`}
            pathLength={100}
            strokeLinecap="round"
          />
        </svg>
        <span className="font-display text-3xl font-bold text-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <div>
        <div className={`font-display text-xl font-semibold ${tone}`}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function AtsPanel({ data }: { data: ResumeData }) {
  const r = useMemo(() => scoreResume(data), [data]);
  return (
    <div className="space-y-5">
      <Ring value={r.score} label={`${r.band} ATS score`} />
      <p className="text-xs text-muted-foreground">
        How ATS-friendly and complete this resume is. To see how well it fits a
        specific job, use the Job Match tab.
      </p>
      <div className="space-y-3 rounded-md border border-border bg-card/60 p-3">
        {r.breakdown.map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>
                {b.label}
                {b.weight !== undefined && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {Math.round(b.weight * 100)}%
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">{b.value}</span>
            </div>
            <Progress value={b.value} />
          </div>
        ))}
      </div>
      {r.issues.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">To improve</h3>
          <ul className="space-y-2">
            {r.issues.map((i) => (
              <li key={i} className="flex gap-2 text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}
      {r.wins.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Working well</h3>
          <ul className="space-y-2">
            {r.wins.map((i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const MAX_TAILOR_CHARS = 10_000;
const MIN_TAILOR_CHARS = 40;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-xs font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Chips({
  items,
  tone,
  limit = 14,
}: {
  items: string[];
  tone: "success" | "warning";
  limit?: number;
}) {
  const chip = (label: string) => (
    <li
      key={label}
      className={`rounded-full px-2 py-0.5 text-xs ${
        tone === "success"
          ? "bg-success-soft text-success-soft-foreground"
          : "bg-warning-soft text-warning-soft-foreground"
      }`}
    >
      {label}
    </li>
  );
  const shown = items.slice(0, limit);
  const rest = items.slice(limit);
  return (
    <>
      <ul className="flex flex-wrap gap-1.5">{shown.map(chip)}</ul>
      {rest.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">+{rest.length} more</summary>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">{rest.map(chip)}</ul>
        </details>
      )}
    </>
  );
}

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <>
      <CheckCircle2 aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />
      <span className="sr-only">Found:</span>
    </>
  ) : (
    <>
      <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />
      <span className="sr-only">Not found:</span>
    </>
  );
}

function Lines({ lines }: { lines: { ok: boolean; text: string }[] }) {
  return (
    <ul className="space-y-1">
      {lines.map((line) => (
        <li key={line.text} className="flex gap-1.5 text-xs">
          <Check ok={line.ok} />
          <span>{line.text}</span>
        </li>
      ))}
    </ul>
  );
}

function RequirementList({
  title,
  items,
}: {
  title: string;
  items: { label: string; found: boolean }[];
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-1">
      <h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.label} className="flex gap-1.5 text-xs">
            <Check ok={item.found} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JobMatchReport({ result }: { result: JobMatchResult }) {
  const scored = result.score !== null;
  const requiredItems = result.required;
  const preferredItems = result.preferred;
  return (
    <div className="space-y-4" aria-live="polite">
      {scored && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Job Match Score
            </p>
            <Ring value={result.score as number} label={result.band} suffix="%" />
          </div>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Matched</dt>
              <dd className="font-semibold">{result.matched.length}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="text-muted-foreground">Missing</dt>
              <dd className="font-semibold">{result.missing.length}</dd>
            </div>
          </dl>
        </div>
      )}

      {result.message && (
        <p className="flex gap-1.5 text-xs text-muted-foreground">
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {result.message}
        </p>
      )}

      {scored && (
        <Section title={`Why ${result.score}%?`}>
          <div className="space-y-2.5 rounded-md border border-border bg-background/60 p-2.5">
            {result.categories.map((category) => (
              <div key={category.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{category.label}</span>
                  <span className="text-muted-foreground">
                    {category.points === null
                      ? "Not specified"
                      : `${category.points}/${category.max}`}
                  </span>
                </div>
                {category.points !== null && (
                  <Progress value={(category.points / category.max) * 100} />
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {category.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            A resume-analysis indicator, not an employer&apos;s ATS score.
            Categories the job description does not specify are left out
            instead of counting as zero.
          </p>
        </Section>
      )}

      {result.matched.length > 0 && (
        <Section title="Matched keywords">
          <Chips tone="success" items={result.matched.map((t) => t.label)} />
        </Section>
      )}
      {result.missing.length > 0 && (
        <Section title="Missing keywords">
          <Chips tone="warning" items={result.missing.map((t) => t.label)} />
          <p className="text-[11px] text-muted-foreground">
            Not found in your resume. These are never added automatically; only
            add a skill if you genuinely have it.
          </p>
        </Section>
      )}

      {(requiredItems.length > 0 || preferredItems.length > 0) && (
        <Section title="Job requirements">
          <div className="space-y-2.5">
            <RequirementList title="Required" items={requiredItems} />
            <RequirementList title="Preferred" items={preferredItems} />
          </div>
        </Section>
      )}
      {result.experience.length > 0 && (
        <Section title="Experience alignment">
          <Lines lines={result.experience} />
        </Section>
      )}
      {result.education.length > 0 && (
        <Section title="Education & certifications">
          <Lines lines={result.education} />
        </Section>
      )}

      {result.strengths.length > 0 && (
        <Section title="Your strengths">
          <Lines lines={result.strengths.map((text) => ({ ok: true, text }))} />
        </Section>
      )}
      {result.gaps.length > 0 && (
        <Section title="Main gaps">
          <ul className="space-y-1">
            {result.gaps.map((gap) => (
              <li key={gap} className="flex gap-1.5 text-xs">
                <span aria-hidden className="text-muted-foreground">
                  •
                </span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function JobMatchPanel({
  data,
  onTailor,
  tailoring,
  jobDescription,
  onJobDescriptionChange,
}: {
  data: ResumeData;
  onTailor?: (jobDescription: string) => void;
  tailoring?: boolean;
  /** Optional controlled value, so the pasted text survives tab switches. It is held in memory only, never saved. */
  jobDescription?: string;
  onJobDescriptionChange?: (value: string) => void;
}) {
  const [local, setLocal] = useState("");
  const description = jobDescription ?? local;
  const setDescription = (value: string) => {
    if (onJobDescriptionChange) onJobDescriptionChange(value);
    else setLocal(value);
  };
  const debounced = useDebounce(description, 300);
  // Clearing the box resets the panel immediately; typing waits for a short pause.
  const analysed = description.trim() ? debounced : "";
  const result = useMemo(
    () => analyzeJobMatch(data, analysed),
    [data, analysed],
  );
  const trimmed = description.trim();
  const tooLong = trimmed.length > MAX_TAILOR_CHARS;

  return (
    <div className="space-y-4 rounded-md border border-border bg-card/60 p-3">
      <div className="flex items-center gap-2">
        <BriefcaseBusiness className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Job match</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        How well this resume fits one specific job. This is different from your
        ATS score, which shows how ATS-friendly the resume is.
      </p>
      <textarea
        aria-label="Job description for match analysis"
        className="min-h-36 w-full resize-y rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Paste the job description here…"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      {result.status === "empty" && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Paste a job description to see how well your resume matches this
          role.
        </p>
      )}
      {result.status === "short" && (
        <p
          className="flex gap-1.5 text-xs text-muted-foreground"
          aria-live="polite"
        >
          <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {result.message}
        </p>
      )}
      {result.status === "ready" && <JobMatchReport result={result} />}

      {onTailor && (
        <div className="space-y-1.5 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              tailoring || trimmed.length < MIN_TAILOR_CHARS || tooLong
            }
            onClick={() => onTailor(trimmed)}
          >
            {tailoring ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {tailoring ? "Tailoring…" : "Tailor to Job"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {tooLong
              ? `Tailor to Job accepts up to ${MAX_TAILOR_CHARS.toLocaleString()} characters. Trim the description to use it.`
              : "Suggests wording and skill order for this role using only what your resume already supports. Missing keywords are never added, and you review every change."}
          </p>
        </div>
      )}
    </div>
  );
}
