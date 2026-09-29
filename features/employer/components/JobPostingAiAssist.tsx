"use client";

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

import type {
  JobPostingAiFieldKey,
  JobPostingAiResult,
} from "@/types/jobPostingAi";

import { getApiErrorMessage } from "@/lib/apiError";
import { cn } from "@/lib/utils";

interface JobPostingAiAssistProps {
  onApply: (patch: Partial<EmployerJobPayload>) => void;

  onCompanyNameExtracted?: (companyName: string) => void;

  defaultLocation?: string;
}

function isSuggested(
  result: JobPostingAiResult,
  field: JobPostingAiFieldKey,
): boolean {
  return result.suggestedFields?.includes(field);
}

export default function JobPostingAiAssist({
  onApply,
  onCompanyNameExtracted,
  defaultLocation = "",
}: JobPostingAiAssistProps) {
  const [input, setInput] = useState("");

  const [locationHint, setLocationHint] = useState(defaultLocation);

  const [loading, setLoading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);

  const [result, setResult] = useState<JobPostingAiResult | null>(null);

  const [selected, setSelected] = useState<Set<JobPostingAiFieldKey>>(
    () => new Set(ALL_AI_FIELD_KEYS),
  );

  const toggleField = (key: JobPostingAiFieldKey) => {
    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const runGenerate = useCallback(async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || trimmedInput.length < 3) {
      toast.error("Enter a job title or description (at least 3 characters).");

      return;
    }

    try {
      setLoading(true);

      const data = await jobPostingAiService.generate({
        input: trimmedInput,
        location: locationHint.trim() || undefined,
      });

      setResult(data);

      if (data.companyName) {
        onCompanyNameExtracted?.(data.companyName);
      }

      setSelected(new Set(ALL_AI_FIELD_KEYS));

      setPreviewOpen(true);
    } catch (error) {
      toast.error("AI generation failed.", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }, [input, locationHint, onCompanyNameExtracted]);

  const applyFields = (keys: Set<JobPostingAiFieldKey>) => {
    if (!result) return;

    const patch = mapAiResultToFormPatch(result, keys);

    onApply(patch);

    setPreviewOpen(false);

    toast.success("Form updated", {
      description: `${keys.size} field${
        keys.size === 1 ? "" : "s"
      } applied. Review the form before saving.`,
    });
  };

  const fieldPreviews = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      {
        key: "title" as const,
        value: result.title,
      },

      {
        key: "companyName" as const,
        value: result.companyName,
      },

      {
        key: "category" as const,
        value: result.category,
      },

      {
        key: "description" as const,
        value: result.description,
      },

      {
        key: "responsibilities" as const,
        value: result.responsibilities?.length
          ? result.responsibilities.map((item) => `- ${item}`).join("\n")
          : "",
      },

      {
        key: "requirements" as const,
        value: result.requirementsText,
      },

      {
        key: "tags" as const,
        value: result.tags?.join(", ") || "",
      },

      {
        key: "jobType" as const,
        value: result.jobType,
      },

      {
        key: "workMode" as const,
        value: result.workMode,
      },

      {
        key: "experienceLevel" as const,
        value: result.experienceLevel,
      },

      {
        key: "educationLevel" as const,
        value: result.educationLevel,
      },

      {
        key: "location" as const,
        value: result.location,
      },

      {
        key: "salaryMin" as const,
        value: result.salaryMin !== null ? String(result.salaryMin) : "",
      },

      {
        key: "salaryMax" as const,
        value: result.salaryMax !== null ? String(result.salaryMax) : "",
      },

      {
        key: "applicationDeadline" as const,
        value: result.applicationDeadline || "",
      },

      {
        key: "application" as const,
        value: result.applicationUrl
          ? `${result.applicationMethod}: ${result.applicationUrl}`
          : "",
      },
    ];
  }, [result]);

  const availableFieldCount = fieldPreviews.filter(({ value }) =>
    Boolean(value && value !== "-"),
  ).length;

  return (
    <>
      <section className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">AI job posting assistant</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Paste a job title, short brief, or complete job description. The
              AI will extract the available job information without inventing
              missing details.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ai-input">Job posting source</Label>

            <Textarea
              id="ai-input"
              rows={8}
              className="font-mono text-sm max-h-48 resize-none overflow-y-auto"
              placeholder={`Examples:

• Frontend Software Engineer

• We need a React + TypeScript developer
  for internal dashboards...

• Paste the complete job description from
  a job board or employer website.`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="max-w-sm space-y-2">
            <Label htmlFor="ai-location">Location hint (optional)</Label>

            <Input
              id="ai-location"
              placeholder="Nairobi, Kenya"
              value={locationHint}
              onChange={(event) => setLocationHint(event.target.value)}
              disabled={loading}
            />

            <p className="text-xs text-muted-foreground">
              Used only when the source itself does not provide a location.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={runGenerate}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Extract job details
            </>
          )}
        </Button>
      </section>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Extracted job details
            </DialogTitle>

            <DialogDescription>
              Review the extracted information before applying it to the job
              posting form.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-5">
              {result.companyName && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Company detected
                  </p>

                  <p className="mt-1 font-medium">{result.companyName}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {result.category && (
                  <Badge variant="secondary">{result.category}</Badge>
                )}

                {result.jobType && (
                  <Badge variant="outline">{result.jobType}</Badge>
                )}

                {result.workMode && (
                  <Badge variant="outline">{result.workMode}</Badge>
                )}

                {result.experienceLevel && (
                  <Badge variant="outline">{result.experienceLevel}</Badge>
                )}

                {result.salaryConfidence > 0 && (
                  <Badge variant="outline">
                    Salary confidence: {result.salaryConfidence}%
                  </Badge>
                )}
              </div>

              {result.slug && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    SEO preview
                  </p>

                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Slug:</span>{" "}
                    <code className="text-xs">{result.slug}</code>
                  </p>

                  {result.metaDescription && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.metaDescription}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Extracted fields</span>

                <Badge variant="secondary">{availableFieldCount}</Badge>
              </div>

              <div className="space-y-3">
                {fieldPreviews.map(({ key, value }) => {
                  const suggested = isSuggested(result, key);

                  const checked = selected.has(key);

                  const hasValue = Boolean(value && value !== "-");

                  return (
                    <label
                      key={key}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
                        checked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border",
                        !hasValue && "cursor-default opacity-60",
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
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {AI_FIELD_LABELS[key]}
                          </span>

                          {suggested && (
                            <Badge variant="outline" className="text-[10px]">
                              Extracted
                            </Badge>
                          )}
                        </div>

                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {value || "Not provided in source"}
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
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
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
                onClick={() =>
                  result && applyFields(new Set(ALL_AI_FIELD_KEYS))
                }
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
