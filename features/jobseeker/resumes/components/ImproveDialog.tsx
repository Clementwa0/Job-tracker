"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { isChangeStale, type ResumeChange } from "@/lib/resume/improve";
import type { ResumeData } from "@/lib/resume/types";
import type { ImprovementState } from "@/features/jobseeker/resumes/useResumeImprovement";

type Decision = "accept" | "reject";

/** Shown on a suggestion whose content the user edited after the AI generated it. */
export const STALE_MESSAGE = "This suggestion is outdated because you edited this content.";

interface Props {
  state: ImprovementState;
  /** The resume as it is now, used to detect suggestions that are no longer based on the current text. */
  data: ResumeData;
  onClose: () => void;
  onRetry: () => void;
  onApply: (accepted: ResumeChange[]) => void;
}

export function ImproveDialog({ state, data, onClose, onRetry, onApply }: Props) {
  const tailor = state.status !== "idle" && state.request.action === "tailor_to_job";
  return (
    <Dialog open={state.status !== "idle"} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /> {tailor ? "Tailor to job" : "AI improvements"}</DialogTitle>
          <DialogDescription>{tailor ? "Suggestions use only what your resume already supports. Nothing changes until you accept it." : "Your resume stays unchanged until you accept a suggestion."}</DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div role="status" aria-live="polite" className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" /> {tailor ? "Tailoring your resume..." : "Improving your resume..."}
          </div>
        )}

        {state.status === "error" && (
          <div role="alert" className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-destructive">{state.message}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}><RefreshCw /> Try again</Button>
            </div>
          </div>
        )}

        {state.status === "review" && <ReviewList key={state.changes.map((c) => c.key).join("|")} data={data} changes={state.changes} keywords={state.keywords} tailor={tailor} onClose={onClose} onApply={onApply} />}

        {state.status !== "review" && (
          <DialogFooter><Button variant="outline" onClick={onClose}>{state.status === "loading" ? "Cancel" : "Close"}</Button></DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewList({ data, changes, keywords, tailor, onClose, onApply }: { data: ResumeData; changes: ResumeChange[]; keywords?: { matched: string[]; missing: string[] }; tailor: boolean; onClose: () => void; onApply: (accepted: ResumeChange[]) => void }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  // Recomputed on every render from the live resume: a change is stale as soon as its field differs from what the AI saw.
  const stale = new Set(changes.filter((change) => isChangeStale(data, change)).map((change) => change.key));
  const fresh = changes.filter((change) => !stale.has(change.key));
  const accepted = fresh.filter((change) => decisions[change.key] === "accept");

  if (!changes.length) {
    return (
      <>
        <div className="min-h-0 space-y-4 overflow-y-auto">
          <p className="py-2 text-sm text-muted-foreground">{tailor ? "No wording changes to suggest for this job." : "No improvements to suggest. Your resume content already reads well."}</p>
          {keywords && <KeywordPanel keywords={keywords} />}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </>
    );
  }

  const decide = (key: string, decision: Decision) => setDecisions((current) => ({ ...current, [key]: decision }));

  return (
    <>
      <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
        {keywords && <KeywordPanel keywords={keywords} />}
        {changes.map((change) => {
          const isStale = stale.has(change.key);
          const decision = isStale ? undefined : decisions[change.key];
          return (
            <section key={change.key} className={`rounded-md border p-3 ${decision === "accept" ? "border-primary/50" : "border-border"} ${decision === "reject" || isStale ? "opacity-60" : ""}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{change.section}{change.section !== change.label && <span className="normal-case tracking-normal"> · {change.label}</span>}</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded bg-muted/60 p-2">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Before</p>
                  <p className="whitespace-pre-line text-sm">{change.before}</p>
                </div>
                <div className="rounded bg-primary/5 p-2">
                  <p className="mb-1 text-xs font-medium text-primary">After</p>
                  <p className="whitespace-pre-line text-sm">{change.after}</p>
                </div>
              </div>
              {isStale && (
                <p role="status" className="mt-2 flex items-center gap-1.5 text-xs text-warning"><AlertTriangle className="size-3.5 shrink-0" /> {STALE_MESSAGE}</p>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <Button size="sm" variant={decision === "reject" ? "secondary" : "outline"} disabled={isStale} onClick={() => decide(change.key, "reject")}><X /> Keep original</Button>
                <Button size="sm" variant={decision === "accept" ? "default" : "outline"} disabled={isStale} onClick={() => decide(change.key, "accept")}><Check /> Accept change</Button>
              </div>
            </section>
          );
        })}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{tailor ? "Cancel" : "Reject all changes"}</Button>
        <Button variant="outline" disabled={!accepted.length} onClick={() => onApply(accepted)}>Apply {accepted.length} accepted</Button>
        <Button disabled={!fresh.length} onClick={() => onApply(fresh)}>{tailor ? "Apply all" : "Accept all changes"}{stale.size > 0 && ` (${fresh.length})`}</Button>
      </DialogFooter>
    </>
  );
}

function KeywordPanel({ keywords }: { keywords: { matched: string[]; missing: string[] } }) {
  if (!keywords.matched.length && !keywords.missing.length) return null;
  return (
    <section className="space-y-3 rounded-md border border-border p-3 text-sm">
      {keywords.matched.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keywords your resume supports</h3>
          <p className="flex flex-wrap gap-1.5">{keywords.matched.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-xs"><Check className="size-3 text-success" />{k}</span>)}</p>
        </div>
      )}
      {keywords.missing.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missing / unsupported keywords</h3>
          <p className="flex flex-wrap gap-1.5">{keywords.missing.map((k) => <span key={k} className="inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-xs"><AlertTriangle className="size-3 text-warning" />{k}</span>)}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">These are not in your resume, so they were not added. Add them yourself only if they are true for you.</p>
        </div>
      )}
    </section>
  );
}
