import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Target, Loader2 } from "lucide-react";
import type { ResumeData } from "@/types/resume-builder";
import { aiService, type MatchResult } from "@/services/aiService";
import { useDebounce } from "@/hooks/useDebounce";
import { extractKeywords } from "@/types/atsScore";
import { resumeToPlainText } from "@/utils/resumeText";
import { toast } from "sonner";
interface Props {
  data: ResumeData;
  onKeywordsChange: (keywords: string[]) => void;
}

function JobMatchPanel({ data, onKeywordsChange }: Props) {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<MatchResult | null>(null);

  // Debounce keyword extraction so the parent doesn't re-render per keystroke.
  const debouncedJd = useDebounce(jd, 300);
  const localKeywords = useMemo(() => extractKeywords(debouncedJd, 20), [debouncedJd]);

  /* Push extracted keywords up once, not inside the textarea onChange. */
  useEffect(() => {
    onKeywordsChange(localKeywords);
  }, [localKeywords, onKeywordsChange]);

  const runAi = useCallback(async () => {
    if (jd.trim().length < 60) {
      toast.error("Please enter a longer job description for better results.");
      return;
    }
    setLoading(true);
    try {
      const result = await aiService.matchResume(resumeToPlainText(data), jd);
      setMatch(result);
      const missing = result.keywords?.missing ?? [];
      const matched = result.keywords?.matched ?? [];
      onKeywordsChange([...matched, ...missing]);
    } catch {
      toast.error("Match failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [data, jd, onKeywordsChange]);

  return (
    <section
      aria-labelledby="job-match-heading"
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-indigo-500" aria-hidden />
          <h3
            id="job-match-heading"
            className="text-sm font-semibold text-gray-900 dark:text-white"
          >
            Tailor to a job
          </h3>
        </div>
        <button
          type="button"
          onClick={runAi}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          ) : (
            <Target className="h-3 w-3" aria-hidden />
          )}
          {loading ? "Analyzing…" : "Run AI match"}
        </button>
      </header>

      <label htmlFor="jd-textarea" className="sr-only">
        Job description
      </label>
      <textarea
        id="jd-textarea"
        rows={4}
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here…"
        className="w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
      />

      {localKeywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1" aria-label="Detected keywords">
          {localKeywords.slice(0, 12).map((k) => (
            <span
              key={k}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {match && (
        <div className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Match score
            </span>
            <span
              className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400"
              aria-label={`Match score ${match.matchScore} out of 100`}
            >
              {match.matchScore}
            </span>
          </div>
          {match.summary && (
            <p className="text-xs text-gray-600 dark:text-gray-300">{match.summary}</p>
          )}
          {match.keywords?.missing && match.keywords.missing.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                Missing keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {match.keywords.missing.slice(0, 12).map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {match.suggestions && match.suggestions.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-4 text-xs text-gray-700 dark:text-gray-300">
              {match.suggestions.slice(0, 5).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default memo(JobMatchPanel);