/**
 * Job ↔ candidate match scoring. Pure functions only (no DB, no framework),
 * so the whole model can be reasoned about and unit-tested in isolation.
 *
 * The score is a weighted average over *evaluable* dimensions: a dimension is
 * only counted when both the candidate and the posting have data for it, so a
 * posting isn't punished for something we can't actually compare (and the
 * candidate isn't rewarded for blanks). Each dimension yields 0..1.
 */

export interface CandidateSignals {
  skills: string[];
  /** Target roles, then headline / resume title as fallbacks. */
  roles: string[];
  location: string;
  preferredLocations: string[];
  workModes: string[];
  jobTypes: string[];
  yearsExperience: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}

export interface PostingSignals {
  title: string;
  description: string;
  requirements: string;
  tags: string[];
  location: string;
  workMode: string;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}

export interface DimensionResult {
  key: DimensionKey;
  label: string;
  weight: number;
  /** null when not evaluable (missing data on either side). */
  score: number | null;
}

export type DimensionKey =
  | "skills"
  | "role"
  | "location"
  | "workMode"
  | "jobType"
  | "experience"
  | "salary";

export interface MatchResult {
  /** 0–100, whole number. */
  score: number;
  matchedSkills: string[];
  reasons: string[];
  dimensions: DimensionResult[];
}

export const WEIGHTS: Record<DimensionKey, number> = {
  skills: 35,
  role: 25,
  location: 10,
  workMode: 5,
  jobType: 7,
  experience: 10,
  salary: 8,
};

/* ------------------------------ text utils ------------------------------ */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Lowercase, keep letters/digits and the symbols that matter in tech names. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .replace(/[\s/]+/g, " ")
    .replace(/(^|\s)[.-]+|[.-]+(\s|$)/g, "$1$2")
    .trim();
}

const SKILL_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  "node.js": "node",
  nodejs: "node",
  "react.js": "react",
  reactjs: "react",
  "next.js": "nextjs",
  "vue.js": "vue",
  vuejs: "vue",
  postgres: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  k8s: "kubernetes",
  golang: "go",
  "c sharp": "c#",
  dotnet: ".net",
  "dot net": ".net",
  ml: "machine learning",
  ai: "artificial intelligence",
  ux: "user experience",
  ui: "user interface",
};

export function canonicalSkill(raw: string): string {
  const n = normalize(raw);
  return SKILL_ALIASES[n] ?? n;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word / whole-phrase containment that understands c++, c#, node.js. */
export function containsTerm(haystack: string, term: string): boolean {
  if (!term) return false;
  const re = new RegExp(`(^|[^a-z0-9+#])${escapeRegex(term)}($|[^a-z0-9+#])`);
  return re.test(haystack);
}

const STOP_WORDS = new Set([
  "a", "an", "the", "of", "and", "or", "for", "at", "in", "to", "with", "on", "-",
]);
const LEVEL_WORDS = new Set([
  "intern", "internship", "trainee", "graduate", "entry", "junior", "jr", "mid",
  "senior", "sr", "lead", "principal", "staff", "head", "level", "i", "ii", "iii",
]);
const ROLE_SYNONYMS: Record<string, string> = {
  developer: "engineer",
  programmer: "engineer",
  dev: "engineer",
  swe: "engineer",
  engineers: "engineer",
  developers: "engineer",
  designers: "designer",
  managers: "manager",
  analysts: "analyst",
};

function roleTokens(text: string): string[] {
  return normalize(text)
    .replace(/-/g, "") // front-end == frontend, full-stack == fullstack
    .split(" ")
    .map((t) => ROLE_SYNONYMS[t] ?? t)
    .filter((t) => t && !STOP_WORDS.has(t) && !LEVEL_WORDS.has(t));
}

/* ------------------------------ dimensions ------------------------------ */

interface SkillsEval {
  score: number | null;
  matched: string[];
}

function evalSkills(c: CandidateSignals, p: PostingSignals): SkillsEval {
  const skills = [...new Set(c.skills.map(canonicalSkill).filter(Boolean))];
  if (skills.length === 0) return { score: null, matched: [] };

  const tags = [...new Set(p.tags.map(canonicalSkill).filter(Boolean))];
  const text = normalize(`${p.title} ${p.requirements} ${p.description}`);
  if (tags.length === 0 && !text) return { score: null, matched: [] };

  // A user skill "shows up" in the posting if it's a tag or appears in the text.
  const matched = skills.filter((s) => tags.includes(s) || containsTerm(text, s));

  const breadth = clamp01(matched.length / 4);
  if (tags.length === 0) return { score: breadth, matched };

  // With explicit required-skill tags, coverage of those tags matters most.
  const covered = tags.filter(
    (t) => skills.includes(t) || skills.some((s) => containsTerm(t, s)),
  ).length;
  return { score: 0.7 * (covered / tags.length) + 0.3 * breadth, matched };
}

function evalRole(c: CandidateSignals, p: PostingSignals): number | null {
  const roles = c.roles.map((r) => r.trim()).filter(Boolean);
  if (roles.length === 0 || !p.title.trim()) return null;

  const title = normalize(p.title);
  const titleTokens = new Set(roleTokens(p.title));

  let best = 0;
  for (const role of roles) {
    const norm = normalize(role);
    if (!norm) continue;
    if (title.includes(norm)) {
      best = 1;
      break;
    }
    const tokens = roleTokens(role);
    if (tokens.length === 0) continue;
    const hit = tokens.filter((t) => titleTokens.has(t)).length;
    best = Math.max(best, hit / tokens.length);
  }
  return best;
}

const isRemote = (p: PostingSignals) =>
  normalize(p.workMode) === "remote" || /\bremote\b/.test(normalize(p.location));

function locationTokens(text: string): string[] {
  return normalize(text.replace(/,/g, " "))
    .split(" ")
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && t !== "remote");
}

function evalLocation(c: CandidateSignals, p: PostingSignals): number | null {
  const wanted = [c.location, ...c.preferredLocations].filter((l) => l.trim());
  if (wanted.length === 0) return null;

  // A remote role is reachable from anywhere; location says nothing about fit.
  if (isRemote(p)) return 1;

  const postingTokens = new Set(locationTokens(p.location));
  if (postingTokens.size === 0) return null;

  const matches = wanted.some((loc) =>
    locationTokens(loc).some((t) => postingTokens.has(t)),
  );
  return matches ? 1 : 0;
}

function evalWorkMode(c: CandidateSignals, p: PostingSignals): number | null {
  const wanted = c.workModes.map(normalize).filter(Boolean);
  const mode = normalize(p.workMode);
  if (wanted.length === 0 || !mode) return null;
  return wanted.includes(mode) ? 1 : 0;
}

const normType = (t: string) => normalize(t).replace(/[\s-]+/g, "");

function evalJobType(c: CandidateSignals, p: PostingSignals): number | null {
  const wanted = c.jobTypes.map(normType).filter(Boolean);
  const type = normType(p.jobType);
  if (wanted.length === 0 || !type) return null;
  return wanted.includes(type) ? 1 : 0;
}

type Level = "entry" | "junior" | "mid" | "senior" | "lead";
const LEVEL_MIN_YEARS: Record<Level, number> = {
  entry: 0,
  junior: 1,
  mid: 3,
  senior: 5,
  lead: 7,
};

function inferLevel(title: string): Level | null {
  const t = normalize(title);
  if (/\b(intern|internship|trainee|graduate|entry)\b/.test(t)) return "entry";
  if (/\b(junior|jr)\b/.test(t)) return "junior";
  if (/\b(lead|principal|staff|head|director)\b/.test(t)) return "lead";
  if (/\b(senior|sr)\b/.test(t)) return "senior";
  return null;
}

/** First explicit "N+ years" requirement in the posting text, if any. */
export function requiredYears(p: PostingSignals): number | null {
  const text = `${p.requirements} ${p.description}`.toLowerCase();
  const m = text.match(/(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?(?:years?|yrs?)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 30 ? n : null;
}

function evalExperience(c: CandidateSignals, p: PostingSignals): number | null {
  if (c.yearsExperience === null) return null;
  const years = c.yearsExperience;

  const explicit = requiredYears(p);
  const level = inferLevel(p.title);
  const required = explicit ?? (level ? LEVEL_MIN_YEARS[level] : null);
  if (required === null) return null;

  if (years >= required) {
    // Way over-qualified for an entry/junior role is a weak fit, not a strong one.
    if (explicit === null && (level === "entry" || level === "junior") && years >= 5) {
      return 0.4;
    }
    return 1;
  }
  return clamp01(1 - (required - years) / Math.max(2, required));
}

function evalSalary(c: CandidateSignals, p: PostingSignals): number | null {
  const hasCandidate = c.salaryMin !== null || c.salaryMax !== null;
  const hasPosting = p.salaryMin !== null || p.salaryMax !== null;
  if (!hasCandidate || !hasPosting) return null;
  // Comparing across currencies would need FX rates; skip rather than guess.
  if (c.salaryCurrency.trim().toUpperCase() !== p.salaryCurrency.trim().toUpperCase()) {
    return null;
  }

  const candMin = c.salaryMin ?? 0;
  const postMax = p.salaryMax ?? Number.POSITIVE_INFINITY;

  // Posting tops out below what the candidate wants: degrade with the gap.
  // Anything that reaches the candidate's minimum is a match (paying more
  // than their ceiling is not a reason to filter a job out).
  if (postMax < candMin) return clamp01(1 - ((candMin - postMax) / candMin) * 2);
  return 1;
}

/* -------------------------------- scoring -------------------------------- */

const LABELS: Record<DimensionKey, string> = {
  skills: "Skills",
  role: "Role",
  location: "Location",
  workMode: "Work mode",
  jobType: "Job type",
  experience: "Experience",
  salary: "Salary",
};

/**
 * Scores one posting against one candidate. Returns null if the candidate has
 * neither skills nor a role to match on — without at least one of those there
 * is no honest basis for a recommendation.
 */
export function scorePosting(c: CandidateSignals, p: PostingSignals): MatchResult | null {
  const skills = evalSkills(c, p);
  const role = evalRole(c, p);
  if (skills.score === null && role === null) return null;

  const raw: Record<DimensionKey, number | null> = {
    skills: skills.score,
    role,
    location: evalLocation(c, p),
    workMode: evalWorkMode(c, p),
    jobType: evalJobType(c, p),
    experience: evalExperience(c, p),
    salary: evalSalary(c, p),
  };

  const dimensions: DimensionResult[] = (Object.keys(raw) as DimensionKey[]).map((key) => ({
    key,
    label: LABELS[key],
    weight: WEIGHTS[key],
    score: raw[key],
  }));

  let earned = 0;
  let possible = 0;
  for (const d of dimensions) {
    if (d.score === null) continue;
    earned += d.weight * d.score;
    possible += d.weight;
  }

  const score = possible === 0 ? 0 : Math.round((earned / possible) * 100);
  return {
    score,
    matchedSkills: skills.matched,
    reasons: buildReasons(dimensions, skills.matched, p),
    dimensions,
  };
}

function buildReasons(dims: DimensionResult[], matched: string[], p: PostingSignals): string[] {
  const by = Object.fromEntries(dims.map((d) => [d.key, d.score])) as Record<DimensionKey, number | null>;
  const out: string[] = [];

  if (matched.length > 0) out.push(`Skills: ${matched.slice(0, 4).join(", ")}`);
  if ((by.role ?? 0) >= 0.5) out.push("Matches your target role");
  if (by.location === 1) out.push(isRemote(p) ? "Remote" : "In your location");
  if (by.workMode === 1) out.push(`${p.workMode} work`);
  if (by.jobType === 1) out.push(p.jobType);
  if ((by.experience ?? 0) >= 0.8) out.push("Fits your experience");
  if ((by.salary ?? 0) >= 0.8) out.push("Salary in range");
  return out;
}
