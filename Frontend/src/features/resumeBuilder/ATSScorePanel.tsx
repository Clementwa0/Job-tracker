import { useMemo } from "react";
import { Gauge, CheckCircle2, AlertCircle } from "lucide-react";
import type { ResumeData } from "@/types/resume-builder";
import { scoreResume } from "./atsScore";

interface Props {
  data: ResumeData;
  jdKeywords?: string[];
}

function color(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function bar(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

export default function ATSScorePanel({ data, jdKeywords = [] }: Props) {
  const result = useMemo(() => scoreResume(data, jdKeywords), [data, jdKeywords]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">ATS score</h3>
        </div>
        <span className={`text-3xl font-bold ${color(result.score)}`}>{result.score}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(result.breakdown).map(([k, v]) => (
          <div key={k}>
            <div className="mb-0.5 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400">
              <span className="capitalize">{k}</span>
              <span>{v}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
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
            <li key={`i${i}`} className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" /> <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
