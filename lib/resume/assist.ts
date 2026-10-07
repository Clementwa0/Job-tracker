import { createFactChecker, sameSkill } from "./importGuard";
import {
  skillsText, type AssistAction, type AssistSuggestion, type AssistTarget, type ResumeImprovement, type TailorResult,
} from "./improve";
import { buildImprovePayload, collectStrings, sanitizeImprovement } from "./improveGuard";
import type { ResumeData } from "./types";

export const ASSIST_ACTIONS: AssistAction[] = ["improve_bullet", "rewrite_summary", "quantify", "shorten", "improve_keywords"];

const ALLOWED_TARGETS: Record<AssistAction, AssistTarget["kind"][]> = {
  improve_bullet: ["bullet", "project"],
  quantify: ["bullet", "project"],
  shorten: ["bullet", "project", "summary"],
  rewrite_summary: ["summary"],
  improve_keywords: ["summary", "skills"],
};

export function parseTarget(raw: unknown): AssistTarget | null {
  if (typeof raw !== "object" || raw === null) return null;
  const t = raw as Record<string, unknown>;
  if (t.kind === "summary" || t.kind === "skills") return { kind: t.kind };
  if (t.kind === "bullet" && typeof t.id === "string" && Number.isInteger(t.index) && (t.index as number) >= 0) return { kind: "bullet", id: t.id, index: t.index as number };
  if (t.kind === "project" && typeof t.id === "string") return { kind: "project", id: t.id };
  return null;
}

export const targetAllowed = (action: AssistAction, target: AssistTarget) => ALLOWED_TARGETS[action].includes(target.kind);

export interface AssistContext {
  /** Text the suggestion replaces (for skills: the text form of the groups). */
  original: string;
  kind: "bullet" | "project description" | "summary" | "skills";
  /** Only what the model needs: no contact details or account information. */
  context: Record<string, unknown>;
}

/** Builds the minimal context for a single-field action from the resume sent by the client. */
export function buildAssistContext(resume: ResumeData, action: AssistAction, target: AssistTarget): AssistContext | null {
  const fullContext = () => ({
    summary: resume.summary,
    title: resume.contact.title,
    experience: resume.experience.map((x) => ({ role: x.role, company: x.company, bullets: x.bullets.filter((b) => b.trim()) })),
    education: resume.education.map((x) => ({ school: x.school, degree: x.degree, field: x.field })),
    skills: resume.skills.map((x) => ({ category: x.category, items: x.items })),
    certifications: resume.certifications.map((x) => ({ name: x.name, issuer: x.issuer })),
  });

  switch (target.kind) {
    case "bullet": {
      const entry = resume.experience.find((x) => x.id === target.id);
      const original = entry?.bullets[target.index]?.trim();
      if (!entry || !original) return null;
      // Only this role's own content is evidence: figures from other jobs must never leak into a bullet.
      return { original, kind: "bullet", context: { role: entry.role, company: entry.company, bullets: entry.bullets.filter((b) => b.trim()) } };
    }
    case "project": {
      const project = resume.projects.find((x) => x.id === target.id);
      const original = project?.description.trim();
      if (!project || !original) return null;
      return { original, kind: "project description", context: { name: project.name, description: project.description, tech: project.tech } };
    }
    case "summary": {
      const original = resume.summary.trim();
      if (!original) return null;
      return { original, kind: "summary", context: action === "shorten" ? { summary: original } : fullContext() };
    }
    case "skills": {
      const original = skillsText(resume.skills);
      if (!resume.skills.length || !original.trim()) return null;
      return { original, kind: "skills", context: { ...fullContext(), summary: resume.summary } };
    }
  }
}

const BANNED_PHRASES = ["proven track record", "results-driven", "results driven", "passionate", "dynamic", "highly motivated", "self-motivated", "hard-working", "hardworking", "team player"];

function oneLine(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").replace(/^[•\-*–\s]+/, "").trim().slice(0, max) : "";
}

/** Validates a single-field suggestion against the content it was based on. Returns the clean suggestion and any problems. */
export function validateAssist(
  action: AssistAction, ctx: AssistContext, parsed: Record<string, unknown>,
): { result: Pick<AssistSuggestion, "suggestion" | "reason" | "skills">; problems: string[] } {
  const checker = createFactChecker(`${collectStrings(ctx.context).join("\n")}\n${ctx.original}`);
  const keywords = action === "improve_keywords";
  const problems: string[] = [];
  const reason = oneLine(parsed.reason, 200);

  // improve_keywords may expand a short product name that is already present ("Excel" -> "Microsoft Excel"); nothing else is relaxed.
  const terms = { expand: keywords };
  const numbersProblem = (text: string) => {
    const bad = checker.unsupportedNumbers(text, true);
    if (bad.length) problems.push(`Contains figures not in the original (${bad.join(", ")}). Do not add numbers.`);
  };

  if (ctx.kind === "skills") {
    const seen = new Set<string>();
    const groups = (Array.isArray(parsed.skills) ? parsed.skills : []).flatMap((group) => {
      if (typeof group !== "object" || group === null) return [];
      const g = group as Record<string, unknown>;
      const items = (Array.isArray(g.items) ? g.items : []).map((item) => oneLine(item, 100)).filter((item) => {
        const key = item.toLowerCase();
        if (!item || seen.has(key)) return false;
        seen.add(key);
        // Exact (normalised) or explicit-alias match only: no partial token overlap.
        const ok = checker.skillSupported(item, terms);
        if (!ok) problems.push(`Skill "${item}" is not in the original`);
        return ok;
      });
      return items.length ? [{ category: oneLine(g.category, 100), items }] : [];
    });
    if (!groups.length) problems.push("No valid skills returned.");
    return { result: { suggestion: skillsText(groups), skills: groups, reason }, problems };
  }

  const max = ctx.kind === "bullet" ? 600 : 2_000;
  const suggestion = oneLine(parsed.suggestion, max);
  if (!suggestion) { problems.push("The suggestion was empty."); return { result: { suggestion: "", reason }, problems }; }

  numbersProblem(suggestion);
  const newTerms = checker.unsupportedTerms(suggestion, terms);
  if (newTerms.length) problems.push(`Mentions terms not in the original: ${newTerms.slice(0, 6).join(", ")}.`);
  if (action === "shorten" && suggestion.length > ctx.original.length) problems.push("The result is not shorter than the original.");
  if (action === "rewrite_summary") {
    const lower = suggestion.toLowerCase();
    const cliches = BANNED_PHRASES.filter((phrase) => lower.includes(phrase) && !checker.sourceText.toLowerCase().includes(phrase));
    if (cliches.length) problems.push(`Avoid generic phrases: ${cliches.join(", ")}.`);
  }
  return { result: { suggestion, reason }, problems };
}

export const buildAssistRequest = (ctx: AssistContext, action: AssistAction) => JSON.stringify({ action, kind: ctx.kind, text: ctx.original, context: ctx.context });

/**
 * Validates a tailor_to_job response. The job description is CONTEXT ONLY, never evidence about the candidate:
 * - wording is checked against the resume alone (new figures, terms, technologies, claims are rejected);
 * - skills may only be re-ordered: any skill that is not already in the resume (exact / alias match) is a problem;
 * - keywords are re-classified against the resume, not trusted from the model, and a missing keyword must not
 *   appear anywhere in the suggested text.
 * Any problem triggers the shared retry and, if it persists, the route rejects the suggestion.
 */
export function sanitizeTailor(
  parsed: Record<string, unknown>, resume: ResumeData, jobDescription: string,
): { result: Omit<TailorResult, "action">; problems: string[] } {
  const all = buildImprovePayload(resume, { section: "all" });
  // Only the summary and experience wording is rewritten, but the whole resume is the evidence (e.g. skills may appear in the summary).
  const { improvement, problems } = sanitizeImprovement(parsed, { summary: all.summary, experience: all.experience }, all);
  const result: ResumeImprovement = { summary: improvement.summary, experience: improvement.experience };

  if (resume.skills.length) {
    const asked = (Array.isArray(parsed.skills) ? parsed.skills : []).filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null);
    const strings = (value: unknown) => (Array.isArray(value) ? value : []).filter((i): i is string => typeof i === "string").map((i) => i.trim()).filter(Boolean);
    const everySkill = resume.skills.flatMap((g) => g.items);
    for (const group of asked) {
      for (const item of strings(group.items)) {
        if (!everySkill.some((existing) => sameSkill(existing, item))) problems.push(`Skill "${item}" is not in the resume; do not add skills from the job description`);
      }
    }
    const used = new Set<number>();
    const groups: { category: string; items: string[] }[] = [];
    const order = (original: { category: string; items: string[] }, wanted: unknown) => {
      const ranked = strings(wanted).flatMap((w) => original.items.filter((item) => sameSkill(item, w)));
      const rest = original.items.filter((item) => !ranked.includes(item));
      return { category: original.category, items: [...new Set([...ranked, ...rest])] };
    };
    for (const g of asked) {
      const index = resume.skills.findIndex((o, i) => !used.has(i) && o.category.trim().toLowerCase() === String(g.category ?? "").trim().toLowerCase());
      if (index >= 0) { used.add(index); groups.push(order(resume.skills[index], g.items)); }
    }
    resume.skills.forEach((o, i) => { if (!used.has(i)) groups.push({ category: o.category, items: o.items }); });
    result.skills = groups;
  }

  const resumeChecker = createFactChecker(collectStrings(all).join("\n"));
  const jd = jobDescription.toLowerCase();
  const list = (value: unknown) => (Array.isArray(value) ? value : []).filter((v): v is string => typeof v === "string").map((v) => v.trim().slice(0, 60)).filter((v) => v && jd.includes(v.toLowerCase()));
  const seen = new Set<string>();
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  for (const keyword of [...list(parsed.matchedKeywords), ...list(parsed.missingKeywords)]) {
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    (resumeChecker.phraseSupported(keyword) ? matchedKeywords : missingKeywords).push(keyword);
  }

  // A keyword the resume does not support stays "Missing": it must not be written into the summary, bullets or skills.
  const suggested = createFactChecker([
    result.summary ?? "", ...(result.experience ?? []).flatMap((e) => e.bullets), ...(result.skills ?? []).flatMap((g) => g.items),
  ].join("\n"));
  for (const keyword of missingKeywords) {
    if (suggested.phraseSupported(keyword)) problems.push(`Job keyword "${keyword}" is not supported by the resume and must not be added to it`);
  }

  return { result: { ...result, matchedKeywords: matchedKeywords.slice(0, 25), missingKeywords: missingKeywords.slice(0, 25), reason: oneLine(parsed.reason, 200) }, problems };
}
