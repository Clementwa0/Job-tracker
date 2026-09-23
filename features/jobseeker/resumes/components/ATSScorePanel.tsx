"use client";

import { useMemo } from "react";
import { Gauge, CheckCircle2, AlertCircle } from "lucide-react";
import type { ResumeData } from "@/types/resume-builder";
import { scoreResume } from "@/features/jobseeker/resumes/utils/atsScore";

interface Props {
  data: ResumeData;
  jdKeywords?: string[];
}

function color(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function bar(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export default function ATSScorePanel({ data, jdKeywords = [] }: Props) {
  const result = useMemo(() => scoreResume(data, jdKeywords), [data, jdKeywords]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">ATS score</h3>
        </div>
        <span className={`text-3xl font-bold ${color(result.score)}`}>{result.score}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(result.breakdown).map(([k, v]) => (
          <div key={k}>
            <div className="mb-0.5 flex items-center justify-between text-[11px] text-muted-foreground dark:text-muted-foreground">
              <span className="capitalize">{k}</span>
              <span>{v}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted bg-card">
              <div className={`h-full ${bar(v)} transition-[width]`} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>

      {(result.wins.length > 0 || result.issues.length > 0) && (
        <ul className="mt-3 space-y-1 text-xs">
          {result.wins.slice(0, 3).map((w, i) => (
            <li key={`w${i}`} className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> <span>{w}</span>
            </li>
          ))}
          {result.issues.slice(0, 5).map((s, i) => (
            <li key={`i${i}`} className="flex items-start gap-1.5 text-foreground text-muted-foreground">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
