import { memo, useMemo } from "react";
import { Gauge, CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";
import type { ResumeData } from "@/types/resume-builder";
import { scoreResume, type AtsBreakdown } from "@/types/atsScore";
import { useDebounce } from "@/hooks/useDebounce";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface Props {
  data: ResumeData;
  jdKeywords?: string[];
}

/* Static label map — defined outside component to avoid recreating per render. */
const LABELS: Record<keyof AtsBreakdown, string> = {
  structure: "Structure",
  formatting: "Formatting",
  keywords: "Keyword Match",
  experienceQuality: "Experience Quality",
  measurableImpact: "Measurable Impact",
  readability: "Readability",
  density: "Resume Density",
  skillsRelevance: "Skills Relevance",
  jobTitleRelevance: "Job Title Relevance",
};

const ORDER = Object.keys(LABELS) as (keyof AtsBreakdown)[];
const EMPTY_KW: string[] = [];

function tone(score: number) {
  if (score >= 80) return { text: "text-emerald-600", bar: "bg-emerald-500" };
  if (score >= 60) return { text: "text-amber-600", bar: "bg-amber-500" };
  return { text: "text-rose-600", bar: "bg-rose-500" };
}

function ATSScorePanel({ data, jdKeywords = EMPTY_KW }: Props) {
  // Debounce: scoring is cheap but runs on every keystroke; 200 ms is invisible
  // to users and prevents wasted work mid-typing.
  const debouncedData = useDebounce(data, 200);
  const debouncedKw = useDebounce(jdKeywords, 200);

  const result = useMemo(
    () => scoreResume(debouncedData, debouncedKw),
    [debouncedData, debouncedKw],
  );

  const animated = useAnimatedNumber(result.score);
  const t = tone(result.score);

  return (
    <section
      aria-labelledby="ats-score-heading"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-indigo-500" aria-hidden />
          <h3
            id="ats-score-heading"
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            ATS score
          </h3>
        </div>
        <div className="text-right">
          <span
            className={`block text-3xl font-bold tabular-nums ${t.text}`}
            aria-live="polite"
            aria-label={`ATS score ${result.score} out of 100 — ${result.band}`}
          >
            {Math.round(animated)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            {result.band}
          </span>
        </div>
      </header>

      <ul className="space-y-2" role="list">
        {ORDER.map((k) => {
          const v = result.breakdown[k];
          const cat = tone(v);
          return (
            <li key={k}>
              <div className="mb-0.5 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
                <span>{LABELS[k]}</span>
                <span className="tabular-nums">{v}</span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                role="progressbar"
                aria-label={LABELS[k]}
                aria-valuenow={v}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full ${cat.bar} transition-[width] duration-500 ease-out`}
                  style={{ width: `${v}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {(result.wins.length > 0 || result.issues.length > 0 || result.penalties.length > 0) && (
        <ul className="mt-3 space-y-1 text-xs" role="list">
          {result.wins.slice(0, 3).map((w, i) => (
            <li
              key={`w${i}`}
              className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              <span>{w}</span>
            </li>
          ))}
          {result.issues.slice(0, 5).map((s, i) => (
            <li
              key={`i${i}`}
              className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300"
            >
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
          {result.penalties.slice(0, 4).map((p, i) => (
            <li
              key={`p${i}`}
              className="flex items-start gap-1.5 text-rose-700 dark:text-rose-400"
            >
              <MinusCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              <span>
                −{p.points} · {p.reason}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default memo(ATSScorePanel);