import { uid, type ResumeData } from "./types";

/** What the "Improve with AI" request covers. */
export interface ImproveScope {
  section: "all" | "summary" | "experience";
  /** With section "experience": improve just this entry's bullets. */
  experienceId?: string;
}

/**
 * Suggestions returned by the improve API. Only wording fields appear here, keyed by the existing entry ids,
 * so employers, titles, schools and dates can never be changed by the AI.
 */
export interface ResumeImprovement {
  summary?: string;
  experience?: { id: string; bullets: string[] }[];
  education?: { id: string; degree: string; field: string; notes: string }[];
  projects?: { id: string; description: string }[];
  skills?: { category: string; items: string[] }[];
  certifications?: { id: string; name: string; issuer: string }[];
}

/** Single actions answered inline, plus the whole-resume actions reviewed in the dialog. */
export type AssistAction = "improve_bullet" | "rewrite_summary" | "quantify" | "shorten" | "improve_keywords";
export type ResumeAiAction = AssistAction | "improve_resume" | "tailor_to_job";

/** The one field an inline AI action works on. */
export type AssistTarget =
  | { kind: "bullet"; id: string; index: number }
  | { kind: "project"; id: string }
  | { kind: "summary" }
  | { kind: "skills" };

/** Structured response for single-field actions. */
export interface AssistSuggestion {
  action: AssistAction;
  target: AssistTarget;
  original: string;
  suggestion: string;
  reason: string;
  /** Present for improve_keywords on skills: the suggested groups (suggestion holds their text form). */
  skills?: { category: string; items: string[] }[];
}

/** Structured response for tailor_to_job: wording changes compatible with ResumeImprovement plus keyword analysis. */
export interface TailorResult extends ResumeImprovement {
  action: "tailor_to_job";
  matchedKeywords: string[];
  missingKeywords: string[];
  reason: string;
}

export const sameTarget = (a?: AssistTarget, b?: AssistTarget) => {
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "bullet" && b.kind === "bullet") return a.id === b.id && a.index === b.index;
  if (a.kind === "project" && b.kind === "project") return a.id === b.id;
  return true;
};

export const skillsText = (groups: { category: string; items: string[] }[]) =>
  groups.map((g) => `${g.category ? `${g.category}: ` : ""}${g.items.join(", ")}`).join("\n");

/** The text a target currently holds in the resume ("" if it no longer exists). */
export function currentTargetText(data: ResumeData, target: AssistTarget): string {
  switch (target.kind) {
    case "bullet": return data.experience.find((x) => x.id === target.id)?.bullets[target.index] ?? "";
    case "project": return data.projects.find((x) => x.id === target.id)?.description ?? "";
    case "summary": return data.summary;
    case "skills": return skillsText(data.skills);
  }
}

/** Applies one accepted suggestion, or returns null if the field was edited since the suggestion was made. */
export function applyAssistSuggestion(data: ResumeData, s: AssistSuggestion): ResumeData | null {
  if (!same(currentTargetText(data, s.target), s.original)) return null;
  const t = s.target;
  switch (t.kind) {
    case "bullet":
      return { ...data, experience: data.experience.map((x) => (x.id === t.id ? { ...x, bullets: x.bullets.map((b, i) => (i === t.index ? s.suggestion : b)) } : x)) };
    case "project":
      return { ...data, projects: data.projects.map((x) => (x.id === t.id ? { ...x, description: s.suggestion } : x)) };
    case "summary":
      return { ...data, summary: s.suggestion };
    case "skills":
      return s.skills?.length ? { ...data, skills: s.skills.map((g) => ({ id: uid(), ...g })) } : null;
  }
}

/**
 * One reviewable suggestion. `before` is the value the AI saw when it made the suggestion; `current` reads the same value
 * from the editor now, so a change whose field was edited since can be detected (see isChangeStale) and never applied.
 */
export interface ResumeChange {
  key: string;
  section: string;
  label: string;
  before: string;
  after: string;
  /** The field's value in the given resume, in the same form as `before`. */
  current: (data: ResumeData) => string;
  apply: (data: ResumeData) => ResumeData;
}

const same = (a: string, b: string) => a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
const bulletText = (bullets: string[]) => bullets.map((b) => `• ${b}`).join("\n");
const clean = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);
const entryBullets = (data: ResumeData, id: string) => bulletText((data.experience.find((x) => x.id === id)?.bullets ?? []).filter((b) => b.trim()));

/** Compares the AI suggestions with the current resume and returns only the entries that actually differ. */
export function buildChanges(data: ResumeData, improvement: ResumeImprovement): ResumeChange[] {
  const changes: ResumeChange[] = [];

  if (typeof improvement.summary === "string" && data.summary.trim() && !same(improvement.summary, data.summary)) {
    const after = improvement.summary.trim();
    changes.push({
      key: "summary", section: "Summary", label: "Professional summary", before: data.summary, after,
      current: (d) => d.summary,
      apply: (d) => ({ ...d, summary: after }),
    });
  }

  for (const next of improvement.experience ?? []) {
    const current = data.experience.find((x) => x.id === next.id);
    const bullets = clean(next.bullets);
    if (!current || !bullets.length) continue;
    const before = bulletText(current.bullets.filter((b) => b.trim()));
    const after = bulletText(bullets);
    if (same(before, after)) continue;
    changes.push({
      key: `experience:${next.id}`, section: "Experience",
      label: [current.role, current.company].filter(Boolean).join(" at ") || "Experience entry", before, after,
      current: (d) => entryBullets(d, next.id),
      apply: (d) => ({ ...d, experience: d.experience.map((x) => (x.id === next.id ? { ...x, bullets } : x)) }),
    });
  }

  for (const next of improvement.education ?? []) {
    const current = data.education.find((x) => x.id === next.id);
    if (!current) continue;
    const text = (e: { degree: string; field: string; notes: string }) => [e.degree, e.field, e.notes].filter(Boolean).join(" · ");
    if (same(text(current), text(next))) continue;
    changes.push({
      key: `education:${next.id}`, section: "Education", label: current.school || "Education entry",
      before: text(current), after: text(next),
      current: (d) => { const e = d.education.find((x) => x.id === next.id); return e ? text(e) : ""; },
      apply: (d) => ({ ...d, education: d.education.map((x) => (x.id === next.id ? { ...x, degree: next.degree, field: next.field, notes: next.notes } : x)) }),
    });
  }

  for (const next of improvement.projects ?? []) {
    const current = data.projects.find((x) => x.id === next.id);
    if (!current || !next.description.trim() || same(current.description, next.description)) continue;
    changes.push({
      key: `project:${next.id}`, section: "Projects", label: current.name || "Project",
      before: current.description, after: next.description.trim(),
      current: (d) => d.projects.find((x) => x.id === next.id)?.description ?? "",
      apply: (d) => ({ ...d, projects: d.projects.map((x) => (x.id === next.id ? { ...x, description: next.description.trim() } : x)) }),
    });
  }

  if (improvement.skills?.length) {
    const groups = improvement.skills.map((g) => ({ category: g.category.trim(), items: clean(g.items) })).filter((g) => g.items.length);
    if (groups.length && !same(skillsText(data.skills), skillsText(groups))) {
      changes.push({
        key: "skills", section: "Skills", label: "Skills", before: skillsText(data.skills), after: skillsText(groups),
        current: (d) => skillsText(d.skills),
        apply: (d) => ({ ...d, skills: groups.map((g) => ({ id: uid(), ...g })) }),
      });
    }
  }

  for (const next of improvement.certifications ?? []) {
    const current = data.certifications.find((x) => x.id === next.id);
    if (!current || !next.name.trim()) continue;
    const text = (c: { name: string; issuer: string }) => [c.name, c.issuer].filter(Boolean).join(" · ");
    if (same(text(current), text(next))) continue;
    changes.push({
      key: `certification:${next.id}`, section: "Certifications", label: current.name || "Certification",
      before: text(current), after: text(next),
      current: (d) => { const c = d.certifications.find((x) => x.id === next.id); return c ? text(c) : ""; },
      apply: (d) => ({ ...d, certifications: d.certifications.map((x) => (x.id === next.id ? { ...x, name: next.name.trim(), issuer: next.issuer.trim() } : x)) }),
    });
  }

  return changes;
}

/** True when the user edited this change's field after the AI suggestion was generated (or removed it). */
export const isChangeStale = (data: ResumeData, change: ResumeChange) => !same(change.current(data), change.before);

/**
 * Applies the accepted changes to the latest resume data. A stale change is never applied, so it can't overwrite a newer
 * user edit; the remaining valid changes still go through. Returns what was applied and what was skipped.
 */
export function applyChanges(data: ResumeData, accepted: ResumeChange[]): { data: ResumeData; applied: ResumeChange[]; stale: ResumeChange[] } {
  const applied: ResumeChange[] = [];
  const stale: ResumeChange[] = [];
  const next = accepted.reduce((d, change) => {
    if (isChangeStale(d, change)) { stale.push(change); return d; }
    applied.push(change);
    return change.apply(d);
  }, data);
  return { data: next, applied, stale };
}
