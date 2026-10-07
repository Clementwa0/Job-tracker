"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  BriefcaseBusiness,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { resumeToText, scoreResume } from "@/lib/resume/ats";
import type { ResumeData } from "@/lib/resume/types";

function Ring({ value, label }: { value: number; label: string }) {
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

const STOP_WORDS = new Set(
  "about after again against also among because before being below between both could does doing during each few from further have having into itself more most other over same should some such than that their them then there these they this those through under until very what when where which while will with would your you the and for are but not was were has had can our out all any its may who use using role work experience skills required preferred responsibilities requirements including demonstrate strong team ability candidate position knowledge years".split(
    " ",
  ),
);

export function JobMatchPanel({
  data,
  onTailor,
  tailoring,
}: {
  data: ResumeData;
  onTailor?: (jobDescription: string) => void;
  tailoring?: boolean;
}) {
  const [description, setDescription] = useState("");
  const result = useMemo(() => {
    const resume = resumeToText(data).toLowerCase();
    const terms = [
      ...new Set(description.toLowerCase().match(/[a-z][a-z+#.-]{2,}/g) ?? []),
    ].filter((term) => !STOP_WORDS.has(term));
    const matched = terms.filter((term) => resume.includes(term));
    return {
      matched,
      missing: terms.filter((term) => !resume.includes(term)),
      score: terms.length
        ? Math.round((matched.length / terms.length) * 100)
        : 0,
    };
  }, [data, description]);

  return (
    <div className="space-y-4 rounded-md border border-border bg-card/60 p-3">
      <div className="flex items-center gap-2">
        <BriefcaseBusiness className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Job match</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a job description to compare its keywords with this resume.
      </p>
      <textarea
        aria-label="Job description for match analysis"
        className="min-h-36 w-full resize-y rounded-md border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Paste the job description here…"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      {onTailor && (
        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={tailoring || description.trim().length < 40}
            onClick={() => onTailor(description.trim())}
          >
            {tailoring ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {tailoring ? "Tailoring…" : "Tailor to Job"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Suggests wording and skill order for this role using only what your
            resume already supports. You review every change.
          </p>
        </div>
      )}
      {description.trim() && (
        <div
          className="space-y-3 rounded-md border border-border bg-card/60 p-3"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-sm">
            <span>Keyword coverage</span>
            <strong>{result.score}%</strong>
          </div>
          <Progress value={result.score} />
          <p className="text-xs text-muted-foreground">
            A keyword comparison to guide tailoring, not a hiring prediction.
          </p>
          {result.matched.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold">Found in resume</h3>
              <p className="text-xs text-muted-foreground">
                {result.matched.join(", ")}
              </p>
            </div>
          )}
          {result.missing.length > 0 && (
            <div>
              <h3 className="mb-1 text-xs font-semibold">
                Consider addressing
              </h3>
              <p className="text-xs text-muted-foreground">
                {result.missing.join(", ")}
              </p>
            </div>
          )}
          {!result.matched.length && !result.missing.length && (
            <p className="text-xs text-muted-foreground">
              Add more job description text to compare keywords.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
