"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { aiErrorMessage } from "@/features/jobseeker/resumes/useResumeImprovement";
import { sameTarget, type AssistAction, type AssistSuggestion, type AssistTarget } from "@/lib/resume/improve";
import type { ResumeData } from "@/lib/resume/types";
import type { ApiSuccessResponse } from "@/types/api";

export type AssistState =
  | { status: "idle" }
  | { status: "loading"; action: AssistAction; target: AssistTarget }
  | { status: "error"; action: AssistAction; target: AssistTarget; message: string }
  | { status: "unchanged"; action: AssistAction; target: AssistTarget }
  | { status: "suggestion"; suggestion: AssistSuggestion };

const targetOf = (state: AssistState) => (state.status === "suggestion" ? state.suggestion.target : state.status === "idle" ? undefined : state.target);

/** What the inline AI controls in the editor need. */
export interface ResumeAssistController {
  /** The AI state for one field (idle when the current request/suggestion belongs to another field). */
  stateFor: (target: AssistTarget) => AssistState;
  /** True while any AI request (inline or whole-resume) is running. */
  busy: boolean;
  run: (action: AssistAction, target: AssistTarget) => void;
  /** Applies the current suggestion (the page checks the field was not edited meanwhile). */
  use: () => void;
  cancel: () => void;
}

/** Single-field AI actions: one request at a time, previewed inline, never applied automatically. */
export function useResumeAssist() {
  const [state, setState] = useState<AssistState>({ status: "idle" });
  const run = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);

  const start = useCallback(async (action: AssistAction, target: AssistTarget, data: ResumeData) => {
    if (inFlight.current) return;
    inFlight.current = true;
    const abort = new AbortController();
    controller.current = abort;
    const id = ++run.current;
    setState({ status: "loading", action, target });
    try {
      const response = await axiosInstance.post<ApiSuccessResponse<AssistSuggestion>>("/resumes/improve", { action, resume: data, target }, { signal: abort.signal });
      if (id !== run.current) return;
      const suggestion = response.data.data;
      const norm = (text: string) => text.replace(/\s+/g, " ").trim();
      setState(!suggestion?.suggestion || norm(suggestion.suggestion) === norm(suggestion.original) ? { status: "unchanged", action, target } : { status: "suggestion", suggestion });
    } catch (error) {
      if (id !== run.current || axios.isCancel(error)) return;
      setState({ status: "error", action, target, message: aiErrorMessage(error) });
    } finally {
      if (id === run.current) inFlight.current = false;
    }
  }, []);

  const cancel = useCallback(() => {
    run.current++;
    inFlight.current = false;
    controller.current?.abort();
    controller.current = null;
    setState({ status: "idle" });
  }, []);

  /** The state, only if it belongs to this field. */
  const stateFor = useCallback((target: AssistTarget): AssistState => (sameTarget(targetOf(state), target) ? state : { status: "idle" }), [state]);

  return { state, start, cancel, stateFor, loading: state.status === "loading" };
}
