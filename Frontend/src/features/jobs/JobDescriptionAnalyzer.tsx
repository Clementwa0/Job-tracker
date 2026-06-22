import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, type Dispatch, type SetStateAction } from "react";
import { analyzeJobService } from "@/services/analyzeJobService";
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
    <div className="rounded-lg border border-border/60 p-4 space-y-4 bg-card">
      <h2 className="font-semibold flex items-center gap-2 text-foreground">
        <FileText className="w-4 h-4" />
        Job Description Analyzer
      </h2>

      <textarea
        className="w-full border border-input rounded-md p-3 min-h-[120px] text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
        placeholder="Paste job description here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button onClick={analyze} disabled={loading || !text.trim()} className="gap-2">
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
