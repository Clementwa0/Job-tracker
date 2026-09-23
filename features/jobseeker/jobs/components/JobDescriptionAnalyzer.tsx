"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type Dispatch, type SetStateAction } from "react";
import { analyzeJobService } from "@/features/jobseeker/jobs/services/analyze-job.client";
import { getApiErrorMessage } from "@/lib/apiError";
import { AiResultPanel } from "@/components/ui/AiResultPanel";
import type { Job } from "@/types/job";

interface Props {
  formData: Job;
  setFormData: Dispatch<SetStateAction<Job>>;
}

const JobDescriptionAnalyzer = ({ setFormData }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ title: string; items: string[] }[]>([]);

  const analyze = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setInsights([]);

      const extracted = await analyzeJobService.analyze({ description: text });
      setFormData((prev) => ({ ...prev, ...extracted }));

      const sections = [];
      if (extracted.jobTitle || extracted.companyName) {
        sections.push({
          title: "Extracted details",
          items: [
            extracted.jobTitle && `Role: ${extracted.jobTitle}`,
            extracted.companyName && `Company: ${extracted.companyName}`,
            extracted.location && `Location: ${extracted.location}`,
            extracted.jobType && `Type: ${extracted.jobType}`,
          ].filter(Boolean) as string[],
        });
      }
      if (extracted.matchAnalysis?.strengths?.length) {
        sections.push({
          title: "Key requirements",
          items: extracted.matchAnalysis.strengths,
        });
      }
      setInsights(sections);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <h2 className="flex items-center gap-2 border-b border-border/60 pb-3 text-sm font-semibold text-foreground">
        <FileText className="h-3.5 w-3.5 text-primary" />
        Job Description Analyzer
      </h2>

      <textarea
        className="min-h-[100px] w-full resize-y rounded-lg border border-border bg-background p-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Paste job description here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button onClick={analyze} disabled={loading || !text.trim()} size="sm" className="gap-1.5 h-8 text-xs">
        {loading ? "Analyzing…" : "Auto Fill"}
      </Button>

      {(loading || error || insights.length > 0) && (
        <AiResultPanel
          title="Analysis results"
          loading={loading}
          error={error}
          onRetry={analyze}
          sections={insights.map((s) => ({ ...s, variant: "info" as const }))}
        />
      )}
    </div>
  );
};

export default JobDescriptionAnalyzer;