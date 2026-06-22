import { useCallback, useMemo, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { jobPostingAiService } from "@/features/employer/services/jobPostingAiService";
import {
  AI_FIELD_LABELS,
  ALL_AI_FIELD_KEYS,
  mapAiResultToFormPatch,
} from "@/features/employer/lib/mapAiToJobForm";
import type { EmployerJobPayload } from "@/types/employer";
import type { JobPostingAiFieldKey, JobPostingAiResult } from "@/types/jobPostingAi";
import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";

interface JobPostingAiAssistProps {
  onApply: (patch: Partial<EmployerJobPayload>) => void;
  defaultLocation?: string;
}

function isSuggested(result: JobPostingAiResult, field: string) {
  return result.suggestedFields?.includes(field);
}

export default function JobPostingAiAssist({ onApply, defaultLocation = "" }: JobPostingAiAssistProps) {
  const [input, setInput] = useState("");
  const [locationHint, setLocationHint] = useState(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [result, setResult] = useState<JobPostingAiResult | null>(null);
  const [selected, setSelected] = useState<Set<JobPostingAiFieldKey>>(
    () => new Set(ALL_AI_FIELD_KEYS),
  );

  const toggleField = (key: JobPostingAiFieldKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runGenerate = useCallback(async () => {
    if (!input.trim() || input.trim().length < 3) {
      toast.error("Enter a job title or description (at least 3 characters)");
      return;
    }
    try {
      setLoading(true);
      const data = await jobPostingAiService.generate({
        input: input.trim(),
        location: locationHint.trim() || undefined,
      });
      setResult(data);
      setSelected(new Set(ALL_AI_FIELD_KEYS));
      setPreviewOpen(true);
    } catch (err) {
      toast.error("AI generation failed", { description: getApiErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, [input, locationHint]);

  const applyFields = (keys: Set<JobPostingAiFieldKey>) => {
    if (!result) return;
    const patch = mapAiResultToFormPatch(result, keys);
    onApply(patch);
    setPreviewOpen(false);
    toast.success("Form updated", {
      description: `${keys.size} field${keys.size === 1 ? "" : "s"} applied. Review before saving.`,
    });
  };

  const fieldPreviews = useMemo(() => {
    if (!result) return [];
    return [
      { key: "title" as const, value: result.title },
      { key: "description" as const, value: result.description },
      { key: "requirements" as const, value: result.requirementsText },
      { key: "tags" as const, value: result.tags.join(", ") },
      { key: "jobType" as const, value: result.jobType },
      { key: "workMode" as const, value: result.workMode },
      { key: "location" as const, value: result.location },
      {
        key: "salaryMin" as const,
        value: result.salaryMin != null ? String(result.salaryMin) : "—",
      },
      {
        key: "salaryMax" as const,
        value: result.salaryMax != null ? String(result.salaryMax) : "—",
      },
    ];
  }, [result]);

  return (
    <>
      <section className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">AI job posting assistant</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a title, short brief, or full job description — we&apos;ll draft a professional posting.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ai-input">Your input</Label>
            <Textarea
              id="ai-input"
              rows={4}
              placeholder={`Examples:\n• Frontend Software Engineer\n• We need a React + TypeScript developer for internal dashboards…\n• [Paste full job description]`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="ai-location">Location hint (optional)</Label>
            <Input
              id="ai-location"
              placeholder="Nairobi, Kenya"
              value={locationHint}
              onChange={(e) => setLocationHint(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <Button type="button" onClick={runGenerate} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generated job posting
            </DialogTitle>
            <DialogDescription>
              Review suggestions, select fields to apply, then accept or regenerate.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {result.jobCategory && (
                  <Badge variant="secondary">{result.jobCategory}</Badge>
                )}
                {result.seniorityLevel && (
                  <Badge variant="outline">{result.seniorityLevel}</Badge>
                )}
                {result.salaryConfidence > 0 && (
                  <Badge variant="outline">
                    Salary confidence: {result.salaryConfidence}%
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  SEO preview
                </p>
                <p>
                  <span className="text-muted-foreground">Slug: </span>
                  <code className="text-xs">{result.slug}</code>
                </p>
                <p className="text-muted-foreground">{result.metaDescription}</p>
              </div>

              <div className="space-y-3">
                {fieldPreviews.map(({ key, value }) => {
                  const suggested =
                    isSuggested(result, key) ||
                    (key === "salaryMin" && result.salaryMin == null) ||
                    (key === "salaryMax" && result.salaryMax == null);
                  const checked = selected.has(key);
                  const hasValue = value && value !== "—";

                  return (
                    <label
                      key={key}
                      className={cn(
                        "flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                        checked ? "border-primary/40 bg-primary/5" : "border-border",
                        !hasValue && "opacity-60",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-border"
                        checked={checked}
                        disabled={!hasValue}
                        onChange={() => toggleField(key)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{AI_FIELD_LABELS[key]}</span>
                          {suggested && (
                            <Badge variant="outline" className="text-[10px]">
                              Suggested
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                          {value || "Not generated"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={runGenerate}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Regenerate
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={!result || selected.size === 0}
                onClick={() => result && applyFields(selected)}
              >
                Apply selected ({selected.size})
              </Button>
              <Button
                type="button"
                disabled={!result}
                onClick={() => result && applyFields(new Set(ALL_AI_FIELD_KEYS))}
              >
                Accept all
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
