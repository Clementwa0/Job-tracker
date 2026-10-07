import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { buildAssistSystemPrompt, TAILOR_SYSTEM_PROMPT } from "@/lib/ai/prompts/resumeAssist";
import { RESUME_IMPROVE_SYSTEM_PROMPT } from "@/lib/ai/prompts/resumeImprove";
import { buildRetryFeedback } from "@/lib/ai/prompts/resumeImport";
import { aiFailure, authorizeAiRequest, readJson } from "@/lib/ai/route";
import {
  ASSIST_ACTIONS, buildAssistContext, buildAssistRequest, parseTarget, sanitizeTailor, targetAllowed, validateAssist,
} from "@/lib/resume/assist";
import type { AssistAction, AssistSuggestion, ImproveScope, ResumeAiAction, TailorResult } from "@/lib/resume/improve";
import { buildImprovePayload, isEmptyPayload, sanitizeImprovement } from "@/lib/resume/improveGuard";
import { normalizeResume, type ResumeData } from "@/lib/resume/types";

export const runtime = "nodejs";

const MAX_PAYLOAD_LENGTH = 40_000;
const MIN_JOB_DESCRIPTION = 40;
const MAX_JOB_DESCRIPTION = 10_000;
const MAX_ATTEMPTS = 2;
const SECTIONS = new Set<ImproveScope["section"]>(["all", "summary", "experience"]);
const ACTIONS = new Set<ResumeAiAction>(["improve_resume", "tailor_to_job", ...ASSIST_ACTIONS]);

type Message = { role: "system" | "user" | "assistant"; content: string };
type Attempt<T> = { value: T; problems: string[] };

const fail = (message: string, status: number) => NextResponse.json({ success: false, message }, { status });
/** Existing failure handling for a suggestion that still adds unsupported content after the corrective retry. */
const rejectUnsupported = () => fail("We couldn't produce a suggestion that stays within your resume's facts. Please try again.", 422);

/** Runs Groq (existing helper), validates, and retries once with feedback when the output was not supported by the resume. */
async function generate<T>(system: string, user: string, check: (parsed: Record<string, unknown>) => Attempt<T>): Promise<Attempt<T>> {
  const messages: Message[] = [{ role: "system", content: system }, { role: "user", content: user }];
  let last: Attempt<T> | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const parsed = await chat({ model: MODEL_FALLBACKS.generation, temperature: TEMPERATURE.EXTRACTION, messages });
    last = check(parsed);
    if (!last.problems.length) break;
    console.warn(`Resume AI attempt ${attempt} had unsupported content:`, last.problems);
    messages.push({ role: "assistant", content: JSON.stringify(parsed) }, { role: "user", content: buildRetryFeedback(last.problems) });
  }
  return last!;
}

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request);
  if ("response" in access) return access.response;

  const body = await readJson(request);
  // "action" is optional so the original whole-resume request ({ resume, scope }) keeps working.
  const action = (body?.action ?? "improve_resume") as ResumeAiAction;
  if (!body || typeof body.resume !== "object" || body.resume === null || !ACTIONS.has(action)) {
    return fail("Send the resume and a valid AI action.", 400);
  }
  // Reuse the Resume Builder normalisation; contact details are never sent to the model.
  const resume = normalizeResume(body.resume as never);

  try {
    if (action === "improve_resume") return await improveResume(resume, body.scope);
    if (action === "tailor_to_job") return await tailorToJob(resume, body.jobDescription);
    return await assist(resume, action, body.target);
  } catch (error) {
    return aiFailure(error, "Unable to improve your resume right now. Please try again.");
  }
}

async function improveResume(resume: ResumeData, rawScope: unknown) {
  const raw = (rawScope ?? {}) as Record<string, unknown>;
  if (typeof raw.section !== "string" || !SECTIONS.has(raw.section as ImproveScope["section"])) return fail("Send the resume and what to improve.", 400);
  const scope: ImproveScope = { section: raw.section as ImproveScope["section"], experienceId: typeof raw.experienceId === "string" ? raw.experienceId : undefined };

  const payload = buildImprovePayload(resume, scope);
  if (isEmptyPayload(payload)) return fail("Add some content to your resume first, then try again.", 422);
  const payloadJson = JSON.stringify(payload);
  if (payloadJson.length > MAX_PAYLOAD_LENGTH) return fail("This resume is too long to improve in one go.", 413);

  const result = await generate(RESUME_IMPROVE_SYSTEM_PROMPT, payloadJson, (parsed) => {
    const { improvement, problems } = sanitizeImprovement(parsed, payload);
    return { value: improvement, problems };
  });
  // Never show a suggestion that adds unsupported facts: after the retry, report a failure instead.
  if (result.problems.length) return rejectUnsupported();
  return NextResponse.json({ success: true, data: result.value });
}

async function assist(resume: ResumeData, action: AssistAction, rawTarget: unknown) {
  const target = parseTarget(rawTarget);
  if (!target || !targetAllowed(action, target)) return fail("That AI action isn't available for this part of the resume.", 400);
  const ctx = buildAssistContext(resume, action, target);
  if (!ctx) return fail("Add some text there first, then try again.", 422);
  const userMessage = buildAssistRequest(ctx, action);
  if (userMessage.length > MAX_PAYLOAD_LENGTH) return fail("This resume is too long for that action.", 413);

  const result = await generate(buildAssistSystemPrompt(action), userMessage, (parsed) => {
    const { result: r, problems } = validateAssist(action, ctx, parsed);
    return { value: r, problems };
  });
  // Never show a suggestion that adds unsupported content: after the retry, report a failure instead.
  if (result.problems.length) return rejectUnsupported();
  const data: AssistSuggestion = { action, target, original: ctx.original, ...result.value };
  return NextResponse.json({ success: true, data });
}

async function tailorToJob(resume: ResumeData, rawJobDescription: unknown) {
  const jobDescription = typeof rawJobDescription === "string" ? rawJobDescription.trim() : "";
  if (jobDescription.length < MIN_JOB_DESCRIPTION) return fail("Paste the job description to tailor your resume to.", 422);
  if (jobDescription.length > MAX_JOB_DESCRIPTION) return fail("That job description is too long. Paste the main requirements instead.", 413);
  const payload = buildImprovePayload(resume, { section: "all" });
  if (isEmptyPayload(payload)) return fail("Add some content to your resume first, then try again.", 422);
  const userMessage = JSON.stringify({ jobDescription, resume: payload });
  if (userMessage.length > MAX_PAYLOAD_LENGTH) return fail("This resume is too long to tailor in one go.", 413);

  const result = await generate(TAILOR_SYSTEM_PROMPT, userMessage, (parsed) => {
    const { result: r, problems } = sanitizeTailor(parsed, resume, jobDescription);
    return { value: r, problems };
  });
  // The job description is context only: if the retry still adds unsupported content, reject rather than show it.
  if (result.problems.length) return rejectUnsupported();
  const data: TailorResult = { action: "tailor_to_job", ...result.value };
  return NextResponse.json({ success: true, data });
}
