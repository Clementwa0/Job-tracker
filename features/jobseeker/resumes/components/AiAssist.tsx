"use client";

import { AlertCircle, Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  skillsText,
  type AssistAction,
  type AssistTarget,
  type ResumeAiAction,
} from "@/lib/resume/improve";
import type { ResumeAssistController } from "@/features/jobseeker/resumes/useResumeAssist";

const LABELS: Record<AssistAction, { label: string; aria: string }> = {
  improve_bullet: { label: "Improve", aria: "Improve with AI" },
  quantify: { label: "Quantify", aria: "Quantify with AI" },
  shorten: { label: "Shorten", aria: "Shorten with AI" },
  rewrite_summary: {
    label: "Rewrite with AI",
    aria: "Rewrite summary with AI",
  },
  improve_keywords: {
    label: "Improve Keywords",
    aria: "Improve keywords with AI",
  },
};

/** A compact row of contextual AI actions for one field, with the inline suggestion preview underneath. */
export function AiActions({
  ai,
  target,
  actions,
  current,
}: {
  ai: ResumeAssistController;
  target: AssistTarget;
  actions: AssistAction[];
  current: string;
}) {
  const state = ai.stateFor(target);
  const loadingAction = state.status === "loading" ? state.action : null;
  const hasText = current.trim().length > 0;
  if (!hasText) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {actions.map((action, index) => (
          <Button
            key={action}
            type="button"
            size="xs"
            variant="ghost"
            disabled={ai.busy}
            aria-label={LABELS[action].aria}
            onClick={() => ai.run(action, target)}
            className="text-muted-foreground hover:text-foreground"
          >
            {loadingAction === action ? (
              <Loader2 className="animate-spin" />
            ) : index === 0 ? (
              <Sparkles />
            ) : null}
            {loadingAction === action ? "Working…" : LABELS[action].label}
          </Button>
        ))}
      </div>

      {state.status === "error" && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <span className="min-w-0 flex-1">{state.message}</span>
          <Button type="button" size="xs" variant="ghost" onClick={ai.cancel}>
            Dismiss
          </Button>
        </div>
      )}

      {state.status === "unchanged" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground"
        >
          <span className="min-w-0 flex-1">
            No improvement to suggest. This already reads well.
          </span>
          <Button type="button" size="xs" variant="ghost" onClick={ai.cancel}>
            Dismiss
          </Button>
        </div>
      )}

      {state.status === "suggestion" &&
        normalize(state.suggestion.original) === normalize(current) && (
          <div
            role="region"
            aria-label="AI suggestion"
            className="relative z-10 space-y-2 rounded-md border border-primary/40 bg-card/90 p-3 shadow-lg backdrop-blur-xl"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> AI Suggestion
            </p>
            <p className="whitespace-pre-line text-sm">
              {state.suggestion.skills
                ? skillsText(state.suggestion.skills)
                : state.suggestion.suggestion}
            </p>
            {state.suggestion.reason && (
              <p className="text-xs text-muted-foreground">
                {state.suggestion.reason}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={ai.cancel}
              >
                <X /> Cancel
              </Button>
              <Button type="button" size="sm" onClick={ai.use}>
                <Check /> Use This
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

export type { ResumeAiAction };
