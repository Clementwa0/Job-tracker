"use client";

import { useCallback, useRef, useState } from "react";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { getApiErrorMessage } from "@/lib/apiError";
import { buildChanges, type ImproveScope, type ResumeChange, type ResumeImprovement, type TailorResult } from "@/lib/resume/improve";
import type { ResumeData } from "@/lib/resume/types";
import type { ApiSuccessResponse } from "@/types/api";

/** Whole-resume AI requests, reviewed change by change in the dialog. */
export type ImproveRequest =
  | { action: "improve_resume"; scope: ImproveScope }
  | { action: "tailor_to_job"; jobDescription: string };

export type ImprovementState =
  | { status: "idle" }
  | { status: "loading"; request: ImproveRequest }
  | { status: "error"; request: ImproveRequest; message: string }
  | { status: "review"; request: ImproveRequest; changes: ResumeChange[]; keywords?: { matched: string[]; missing: string[] } };

export const FAILURE_MESSAGE = "Unable to improve your resume right now. Please try again.";

/** Server messages that help the user act (rate limit, missing input); anything else uses the standard message. */
export function aiErrorMessage(error: unknown): string {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 429 || status === 422 || status === 413 ? getApiErrorMessage(error) : FAILURE_MESSAGE;
}

/** Requests whole-resume suggestions. The resume itself is never modified here. */
export function useResumeImprovement() {
  const [state, setState] = useState<ImprovementState>({ status: "idle" });
  const run = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const inFlight = useRef(false);

  const start = useCallback(async (request: ImproveRequest, data: ResumeData) => {
    if (inFlight.current) return; // no duplicate requests
    inFlight.current = true;
    const abort = new AbortController();
    controller.current = abort;
    const id = ++run.current;
    setState({ status: "loading", request });
    try {
      const payload = request.action === "tailor_to_job"
        ? { action: request.action, resume: data, jobDescription: request.jobDescription }
        : { action: request.action, resume: data, scope: request.scope };
      const response = await axiosInstance.post<ApiSuccessResponse<ResumeImprovement & Partial<TailorResult>>>("/resumes/improve", payload, { signal: abort.signal });
      if (id !== run.current) return;
      const result = response.data.data ?? {};
      setState({
        status: "review", request, changes: buildChanges(data, result),
        keywords: request.action === "tailor_to_job" ? { matched: result.matchedKeywords ?? [], missing: result.missingKeywords ?? [] } : undefined,
      });
    } catch (error) {
      if (id !== run.current || axios.isCancel(error)) return;
      setState({ status: "error", request, message: aiErrorMessage(error) });
    } finally {
      if (id === run.current) inFlight.current = false;
    }
  }, []);

  const close = useCallback(() => {
    run.current++;
    inFlight.current = false;
    controller.current?.abort();
    controller.current = null;
    setState({ status: "idle" });
  }, []);

  return { state, start, close, loading: state.status === "loading" };
}
