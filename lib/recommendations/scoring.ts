/**
 * Job ↔ candidate match scoring. Pure functions only (no DB, no framework),
 * so the whole model can be reasoned about and unit-tested in isolation.
 *
 * Two stages:
 *  1. RELEVANCE GATE - a posting must genuinely fit the candidate's skills or
 *     target role, otherwise it is never recommended, no matter how well the
 *     location / salary / job type happen to line up.
 *  2. SCORE - core fit (skills + role) dominates; logistics (location, work
 *     mode, job type, experience, salary) can only adjust it, not rescue it.
 *
 * A dimension is only counted when both the candidate and the posting have
 * data for it, so a posting isn't punished for something we can't compare.
 * Each dimension yields 0..1.
 */

export interface CandidateSignals {
  skills: string[];
  /** Target roles, then the profile headline as a fallback. */
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

/** Dimensions that say whether the job is actually *for* this person. */
const CORE_KEYS: DimensionKey[] = ["skills", "role"];
/** Below this core fit the posting is not relevant, whatever else matches. */
export const MIN_CORE_FIT = 0.35;
/** Share of the final score that comes from core fit (rest is logistics). */
const CORE_SHARE = 0.7;
/** A role/title match must reach this to count as "this is my kind of job". */
const ROLE_HIT = 0.6;

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

/** Appear in nearly every posting, so matching them says nothing about fit. */
const SOFT_SKILLS = new Set([
  "communication", "teamwork", "team player", "leadership", "problem solving",
  "time management", "adaptability", "creativity", "critical thinking",
  "collaboration", "organization", "organisation", "work ethic", "multitasking",
  "attention to detail", "interpersonal skills", "hardworking", "flexibility",
]);

/** Short or common-word skills that false-match prose ("go-getter", "c" level). */
const AMBIGUOUS_SKILLS = new Set(["go", "r", "c", "swift", "spring", "excel", "word", "rust", "ruby", "flow"]);
const isAmbiguousSkill = (s: string) => s.length <= 2 || AMBIGUOUS_SKILLS.has(s);

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

/** Job-title nouns shared by thousands of unrelated roles: never a match on their own. */
const GENERIC_ROLE_WORDS = new Set([
  "engineer", "manager", "analyst", "officer", "assistant", "specialist",
  "executive", "consultant", "associate", "coordinator", "administrator",
  "technician", "supervisor", "representative", "agent", "clerk", "advisor",
  "adviser", "designer", "developer", "support", "team",
]);

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
  /** Matches in the title, tags or requirements (what the job actually needs). */
  strong: number;
  /** Matches only in passing description prose (weaker evidence). */
  weak: number;
}

const NO_SKILLS: SkillsEval = { score: null, matched: [], strong: 0, weak: 0 };

function evalSkills(c: CandidateSignals, p: PostingSignals): SkillsEval {
  const skills = [
    ...new Set(c.skills.map(canonicalSkill).filter((s) => s && !SOFT_SKILLS.has(s))),
  ];
  if (skills.length === 0) return NO_SKILLS;

  const tags = [...new Set(p.tags.map(canonicalSkill).filter(Boolean))];
  const needs = normalize(`${p.title} ${p.requirements}`);
  const body = normalize(p.description);
  if (tags.length === 0 && !needs && !body) return NO_SKILLS;

  const strong: string[] = [];
  const weak: string[] = [];
  for (const s of skills) {
    if (tags.includes(s)) {
      strong.push(s);
    } else if (isAmbiguousSkill(s)) {
      continue; // "go", "r", "c"... only trusted as an explicit tag
    } else if (containsTerm(needs, s)) {
      strong.push(s);
    } else if (containsTerm(body, s)) {
      weak.push(s);
    }
  }
  const matched = [...strong, ...weak];
  const counts = { strong: strong.length, weak: weak.length };

  const breadth = clamp01((strong.length + 0.5 * weak.length) / 4);
  if (tags.length === 0) return { score: breadth, matched, ...counts };

  // With explicit required-skill tags, coverage of those tags matters most.
  const covered = tags.filter(
    (t) =>
      skills.includes(t) ||
      skills.some((s) => !isAmbiguousSkill(s) && containsTerm(t, s)),
  ).length;
  return { score: 0.7 * (covered / tags.length) + 0.3 * breadth, matched, ...counts };
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

    // The distinctive words ("software", "nurse", "accountant") carry the
    // meaning; "engineer"/"manager" alone match half the job board.
    const distinctive = tokens.filter((t) => !GENERIC_ROLE_WORDS.has(t));
    const weightOf = (t: string) => (GENERIC_ROLE_WORDS.has(t) ? 0.25 : 1);
    const total = tokens.reduce((sum, t) => sum + weightOf(t), 0);
    const hit = tokens
      .filter((t) => titleTokens.has(t))
      .reduce((sum, t) => sum + weightOf(t), 0);

    let score = hit / total;
    // Wanted "Software Engineer", posting is "Mechanical Engineer": no overlap
    // on the part that matters, so it is not a role match.
    if (distinctive.length > 0 && !distinctive.some((t) => titleTokens.has(t))) {
      score = Math.min(score, 0.2);
    }
    best = Math.max(best, score);
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
 * Scores one posting against one candidate. Returns null when the posting is
 * not a genuine fit - i.e. it matches neither the candidate's skills nor their
 * target role - or when the candidate has nothing to match on. Logistics such
 * as location or salary never make an irrelevant job relevant.
 */
export function scorePosting(c: CandidateSignals, p: PostingSignals): MatchResult | null {
  const skills = evalSkills(c, p);
  const role = evalRole(c, p);
  if (skills.score === null && role === null) return null;

  // Relevance gate: real skill evidence, or a real role match. Otherwise the
  // job simply isn't for this person.
  const skillsHit = skills.strong >= 1 || skills.weak >= 2;
  const roleHit = role !== null && role >= ROLE_HIT;
  if (!skillsHit && !roleHit) return null;

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

  const average = (dims: DimensionResult[]): number | null => {
    let earned = 0;
    let possible = 0;
    for (const d of dims) {
      if (d.score === null) continue;
      earned += d.weight * d.score;
      possible += d.weight;
    }
    return possible === 0 ? null : earned / possible;
  };

  const core = average(dimensions.filter((d) => CORE_KEYS.includes(d.key)));
  if (core === null || core < MIN_CORE_FIT) return null;

  const logistics = average(dimensions.filter((d) => !CORE_KEYS.includes(d.key)));
  let blended = logistics === null ? core : CORE_SHARE * core + (1 - CORE_SHARE) * logistics;

  // Clearly under-experienced for the level asked (e.g. 2 yrs vs a 5+ yr role):
  // a weaker recommendation even if the skills line up.
  if (raw.experience !== null && raw.experience < 0.6) blended *= 0.75;

  return {
    score: Math.round(clamp01(blended) * 100),
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
