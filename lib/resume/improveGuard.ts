import { createFactChecker } from "./importGuard";
import type { ImproveScope, ResumeImprovement } from "./improve";
import type { ResumeData } from "./types";

/** The only resume content sent to Groq for "Improve with AI". Contact details are never included. */
export interface ImprovePayload {
  summary?: string;
  experience?: { id: string; role: string; company: string; bullets: string[] }[];
  education?: { id: string; school: string; degree: string; field: string; notes: string }[];
  projects?: { id: string; name: string; description: string; tech: string[] }[];
  skills?: { category: string; items: string[] }[];
  certifications?: { id: string; name: string; issuer: string; date: string }[];
}

export function buildImprovePayload(resume: ResumeData, scope: ImproveScope): ImprovePayload {
  const experience = resume.experience
    .filter((x) => !scope.experienceId || x.id === scope.experienceId)
    .map((x) => ({ id: x.id, role: x.role, company: x.company, bullets: x.bullets.filter((b) => b.trim()) }))
    .filter((x) => x.bullets.length);
  const payload: ImprovePayload = {};
  if (scope.section !== "experience" && resume.summary.trim()) payload.summary = resume.summary;
  if (scope.section !== "summary" && experience.length) payload.experience = experience;
  if (scope.section === "all") {
    if (resume.education.length) payload.education = resume.education.map(({ id, school, degree, field, notes }) => ({ id, school, degree, field, notes }));
    if (resume.projects.length) payload.projects = resume.projects.map(({ id, name, description, tech }) => ({ id, name, description, tech }));
    if (resume.skills.length) payload.skills = resume.skills.map(({ category, items }) => ({ category, items }));
    if (resume.certifications.length) payload.certifications = resume.certifications.map(({ id, name, issuer, date }) => ({ id, name, issuer, date }));
  }
  return payload;
}

export const isEmptyPayload = (payload: ImprovePayload) => Object.keys(payload).length === 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : null);
const strings = (value: unknown, limit: number, max: number) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, max)).filter(Boolean).slice(0, limit) : [];
const byId = (value: unknown) => new Map((Array.isArray(value) ? value : []).filter(isRecord).map((item) => [String(item.id), item]));
/** Every text in a payload, used as the evidence a suggestion is checked against. Entry ids are random tokens, not evidence. */
export const collectStrings = (value: unknown): string[] =>
  typeof value === "string" ? [value]
    : Array.isArray(value) ? value.flatMap(collectStrings)
      : isRecord(value) ? Object.entries(value).filter(([key]) => key !== "id").flatMap(([, item]) => collectStrings(item))
        : [];

/**
 * Turns the raw Groq response into a validated ResumeImprovement and checks it against the content that was sent.
 * Every returned text must stay within the original's facts: no new figures, dates, employers, places, certifications,
 * technologies, skills or seniority claims. Anything malformed or unsupported falls back to the original text, so a bad
 * suggestion can never reach the user; `problems` drives the corrective retry and, if still non-empty, the rejection.
 * `evidence` is what counts as the candidate's facts (defaults to the payload); the job description is never evidence.
 */
export function sanitizeImprovement(
  parsed: Record<string, unknown>, payload: ImprovePayload, evidence: ImprovePayload = payload,
): { improvement: ResumeImprovement; problems: string[] } {
  const checker = createFactChecker(collectStrings(evidence).join("\n"));
  const problems: string[] = [];
  const improvement: ResumeImprovement = {};
  const factsOk = (value: string, label: string) => {
    const bad = [
      ...checker.unsupportedNumbers(value, true).map((n) => `figure ${n}`),
      ...checker.unsupportedTerms(value).map((term) => `"${term}"`),
      ...checker.unsupportedClaims(value).map((claim) => `${claim} claim`),
    ];
    if (bad.length) problems.push(`${label}: contains content not in the original (${bad.join(", ")})`);
    return bad.length === 0;
  };

  if (payload.summary !== undefined) {
    const next = text(parsed.summary, 2_000);
    improvement.summary = next && factsOk(next, "Summary") ? next : payload.summary;
  }

  if (payload.experience) {
    const returned = byId(parsed.experience);
    improvement.experience = payload.experience.map((entry) => {
      const bullets = strings(returned.get(entry.id)?.bullets, 12, 600);
      // Check every bullet (no short-circuit) so the retry feedback lists all the problems at once.
      const ok = bullets.length > 0 && bullets.map((b) => factsOk(b, `${entry.role || entry.company} bullet`)).every(Boolean);
      return { id: entry.id, bullets: ok ? bullets : entry.bullets };
    });
  }

  if (payload.education) {
    const returned = byId(parsed.education);
    improvement.education = payload.education.map((entry) => {
      const next = returned.get(entry.id);
      const candidate = { degree: text(next?.degree, 300), field: text(next?.field, 300), notes: text(next?.notes, 1_000) };
      // One field per line so each is checked as its own phrase.
      const joined = [candidate.degree, candidate.field, candidate.notes].filter(Boolean).join("\n");
      const ok = candidate.degree !== null && candidate.field !== null && candidate.notes !== null && factsOk(joined, `${entry.school} education`);
      return ok ? { id: entry.id, degree: candidate.degree!, field: candidate.field!, notes: candidate.notes! } : { id: entry.id, degree: entry.degree, field: entry.field, notes: entry.notes };
    });
  }

  if (payload.projects) {
    const returned = byId(parsed.projects);
    improvement.projects = payload.projects.map((entry) => {
      const next = text(returned.get(entry.id)?.description, 2_000);
      return { id: entry.id, description: next && factsOk(next, `${entry.name} description`) ? next : entry.description };
    });
  }

  if (payload.skills) {
    const seen = new Set<string>();
    const groups = (Array.isArray(parsed.skills) ? parsed.skills : []).filter(isRecord).map((group) => ({
      category: text(group.category, 100) ?? "",
      items: strings(group.items, 50, 100).filter((item) => {
        const key = item.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        if (checker.skillSupported(item)) return true;
        problems.push(`Skill "${item}" is not in the original`);
        return false;
      }),
    })).filter((group) => group.items.length);
    improvement.skills = groups.length ? groups : payload.skills;
  }

  if (payload.certifications) {
    const returned = byId(parsed.certifications);
    improvement.certifications = payload.certifications.map((entry) => {
      const name = text(returned.get(entry.id)?.name, 300);
      const issuer = text(returned.get(entry.id)?.issuer, 300);
      const ok = name !== null && issuer !== null && factsOk(`${name}\n${issuer}`, `${entry.name} certification`);
      return ok ? { id: entry.id, name, issuer } : { id: entry.id, name: entry.name, issuer: entry.issuer };
    });
  }

  return { improvement, problems };
}
