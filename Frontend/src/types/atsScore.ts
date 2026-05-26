import { ACTION_VERBS, ATS_UNFRIENDLY_TOKENS, RESUME_LENGTH_TARGET, scoreBand, STOP_WORDS, WEAK_PHRASES, type ScoreBand } from "@/constants/atsConstants";
import type { ResumeData } from "@/types/resume-builder";
import { resumeToPlainText, wordCount, keywordMatches } from "@/utils/resumeText";


/* ============================================================== *
 *                          Public types                          *
 * ============================================================== */

export interface AtsBreakdown {
  /** Structure of required sections (contact, summary, work, edu, skills). */
  structure: number;
  /** Formatting hygiene — bullet length, caps, ATS-hostile glyphs. */
  formatting: number;
  /** Coverage of JD keywords (or generic tech vocabulary if no JD). */
  keywords: number;
  /** Quality of experience entries — completeness, dates, tenure. */
  experienceQuality: number;
  /** Quantified outcomes ratio across bullets. */
  measurableImpact: number;
  /** Bullet-length sweet spot + plain-language readability. */
  readability: number;
  /** Resume length sits in the recommended word/bullet band. */
  density: number;
  /** Skills section depth vs JD overlap. */
  skillsRelevance: number;
  /** Whether the target title appears in summary or current role. */
  jobTitleRelevance: number;
}

export interface AtsResult {
  /** 0–100 weighted score, penalties already applied. */
  score: number;
  band: ScoreBand;
  breakdown: AtsBreakdown;
  matchedKeywords: string[];
  missingKeywords: string[];
  /** Negative deltas applied — surface in UI for transparency. */
  penalties: { reason: string; points: number }[];
  issues: string[];
  wins: string[];
}

/* ============================================================== *
 *                       Weights & helpers                        *
 * ============================================================== */

/** Weights sum to 1. Tuned so a real but mediocre resume lands ~65, a strong
 *  tailored one ~85, and a weak one well under 60. */
const WEIGHTS: Record<keyof AtsBreakdown, number> = {
  structure: 0.14,
  formatting: 0.1,
  keywords: 0.18,
  experienceQuality: 0.14,
  measurableImpact: 0.16,
  readability: 0.08,
  density: 0.06,
  skillsRelevance: 0.08,
  jobTitleRelevance: 0.06,
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n: number) => Math.round(n);
const pct = (n: number, d: number) => (d <= 0 ? 0 : clamp((n / d) * 100));

const NUMBER_OR_PERCENT = /(?:\$\s?\d|\d+\s?%|\d{2,}|\d+(?:\.\d+)?\s?(?:k|m|b|x))/i;
const URL_RE = /^https?:\/\//i;

function firstWord(s: string): string {
  const m = s.trim().toLowerCase().match(/^[a-z]+/);
  return m?.[0] ?? "";
}

function monthDiff(start: string, end: string, current?: boolean): number {
  if (!start) return 0;
  const s = new Date(`${start}-01`);
  const e = current || !end ? new Date() : new Date(`${end}-01`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  return Math.max(0, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()));
}

/* ============================================================== *
 *                       Main scoring entry                       *
 * ============================================================== */

export function scoreResume(d: ResumeData, jdKeywords: string[] = []): AtsResult {
  const issues: string[] = [];
  const wins: string[] = [];
  const penalties: AtsResult["penalties"] = [];

  const bullets = d.experience
    .flatMap((x) => x.bullets)
    .map((b) => b?.trim() ?? "")
    .filter((b) => b.length > 0);

  const resumeText = resumeToPlainText(d);
  const totalWords = wordCount(resumeText);

  /* ---------- Structure ---------- */
  const contactFields = [
    d.contact.fullName,
    d.contact.email,
    d.contact.phone,
    d.contact.location,
  ];
  const contactScore = pct(contactFields.filter(Boolean).length, contactFields.length);
  const sectionScore =
    (d.summary ? 25 : 0) +
    (d.experience.length > 0 ? 35 : 0) +
    (d.education.length > 0 ? 20 : 0) +
    (d.skills.length > 0 ? 20 : 0);
  let structure = round((contactScore + sectionScore) / 2);

  if (!d.contact.email) {
    issues.push("Missing email address.");
    penalties.push({ reason: "No email on resume", points: 8 });
  }
  if (!d.contact.linkedin) {
    issues.push("Add a LinkedIn URL — recruiters expect it.");
    penalties.push({ reason: "No LinkedIn URL", points: 3 });
  }
  if (!d.summary) {
    issues.push("Add a professional summary at the top.");
    penalties.push({ reason: "Missing summary", points: 4 });
  }
  if (d.experience.length === 0) {
    issues.push("Add at least one work experience.");
    penalties.push({ reason: "No experience entries", points: 12 });
  }
  if (d.skills.length === 0) {
    issues.push("Add a skills section.");
    penalties.push({ reason: "Missing skills section", points: 6 });
  }

  /* ---------- Formatting ---------- */
  let formatIssues = 0;
  let unfriendlyGlyphs = 0;
  for (const b of bullets) {
    if (b.length > 240) formatIssues++;
    if (b.length < 30) formatIssues++;
    if (b === b.toUpperCase() && b.length > 12) formatIssues++;
    for (const g of ATS_UNFRIENDLY_TOKENS) if (b.includes(g)) unfriendlyGlyphs++;
  }
  const formatting = bullets.length === 0
    ? 40
    : round(pct(bullets.length - formatIssues, bullets.length));

  if (formatIssues > 0) {
    issues.push(`${formatIssues} bullet${formatIssues > 1 ? "s have" : " has"} formatting issues (length or caps).`);
  }
  if (unfriendlyGlyphs > 0) {
    issues.push("Replace decorative bullet glyphs (★ ► ✓) — many ATS parsers drop them.");
    penalties.push({ reason: "ATS-unfriendly glyphs", points: 4 });
  }

  /* ---------- Keywords (JD-aware) ---------- */
  let keywords = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  if (jdKeywords.length > 0) {
    for (const k of jdKeywords) {
      if (keywordMatches(resumeText, k)) matched.push(k);
      else missing.push(k);
    }
    keywords = round(pct(matched.length, jdKeywords.length));
    if (missing.length > 0) {
      issues.push(
        `Missing ${missing.length} JD keyword${missing.length > 1 ? "s" : ""}: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}`,
      );
    }
    if (matched.length > 0) {
      wins.push(`${matched.length} JD keyword${matched.length > 1 ? "s" : ""} matched.`);
    }
  } else {
    // Without a JD we evaluate vocabulary richness instead of awarding 100.
    const uniqueTerms = new Set(
      resumeText.toLowerCase().match(/[a-z][a-z+#.\-]{1,}/g)?.filter((t) => !STOP_WORDS.has(t)) ?? [],
    );
    keywords = clamp(round((uniqueTerms.size / 120) * 100));
  }

  /* ---------- Experience quality ---------- */
  let xpScore = 0;
  if (d.experience.length === 0) {
    xpScore = 0;
  } else {
    let totalMonths = 0;
    let complete = 0;
    for (const x of d.experience) {
      const fields = [x.role, x.company, x.startDate].filter(Boolean).length;
      const fieldRatio = fields / 3;
      const hasBullets = x.bullets.filter(Boolean).length >= 2 ? 1 : 0;
      complete += fieldRatio * 0.5 + hasBullets * 0.5;
      totalMonths += monthDiff(x.startDate, x.endDate, x.current);
    }
    const completeness = pct(complete, d.experience.length);
    const tenureBonus = clamp((totalMonths / 36) * 100, 0, 100); // 3y => 100
    xpScore = round(completeness * 0.7 + tenureBonus * 0.3);
  }
  const experienceQuality = xpScore;

  /* ---------- Measurable impact ---------- */
  let strongBullets = 0;
  let weakBullets = 0;
  for (const b of bullets) {
    const lower = b.toLowerCase();
    const startsAction = ACTION_VERBS.has(firstWord(b));
    const hasNumber = NUMBER_OR_PERCENT.test(b);
    const hasWeak = WEAK_PHRASES.some((w) => lower.includes(w));
    if (startsAction && hasNumber) strongBullets++;
    if (hasWeak || !startsAction) weakBullets++;
  }
  let measurableImpact = bullets.length === 0 ? 0 : round(pct(strongBullets, bullets.length));
  if (bullets.length > 0 && strongBullets === 0) {
    penalties.push({ reason: "No quantified achievements", points: 8 });
  }
  if (weakBullets > 0) {
    issues.push(
      `${weakBullets} bullet${weakBullets > 1 ? "s use" : " uses"} weak language — lead with action verbs.`,
    );
    penalties.push({ reason: "Weak bullet phrasing", points: Math.min(6, weakBullets) });
  }
  if (strongBullets > 0) {
    wins.push(`${strongBullets} high-impact bullet${strongBullets > 1 ? "s" : ""} with measurable outcomes.`);
  }

  /* ---------- Readability ---------- */
  let readableBullets = 0;
  for (const b of bullets) {
    const len = b.length;
    const words = b.split(/\s+/).length;
    if (len >= 60 && len <= 200 && words <= 30) readableBullets++;
  }
  const readability = bullets.length === 0 ? 50 : round(pct(readableBullets, bullets.length));

  /* ---------- Density (length) ---------- */
  const { minWords, maxWords, minBullets, maxBullets } = RESUME_LENGTH_TARGET;
  let density = 100;
  if (totalWords < minWords) {
    density = round((totalWords / minWords) * 100);
    issues.push("Resume is too short — aim for at least one full page.");
    penalties.push({ reason: "Resume too short", points: 5 });
  } else if (totalWords > maxWords) {
    density = clamp(round(100 - ((totalWords - maxWords) / maxWords) * 60));
    issues.push("Resume is too long — trim to one or two pages.");
  }
  if (bullets.length < minBullets) {
    density = Math.min(density, round(pct(bullets.length, minBullets)));
    penalties.push({ reason: "Too few bullet points", points: 3 });
  } else if (bullets.length > maxBullets) {
    density = Math.min(density, 80);
  }

  /* ---------- Skills relevance ---------- */
  const allSkills = d.skills.flatMap((s) => s.items).map((s) => s.trim()).filter(Boolean);
  let skillsRelevance: number;
  if (allSkills.length === 0) {
    skillsRelevance = 0;
  } else if (jdKeywords.length > 0) {
    const overlap = jdKeywords.filter((k) =>
      allSkills.some((s) => s.toLowerCase() === k.toLowerCase()),
    ).length;
    skillsRelevance = round(pct(overlap, jdKeywords.length));
    // baseline credit for having a real skills section
    skillsRelevance = clamp(skillsRelevance + Math.min(20, allSkills.length * 2));
  } else {
    skillsRelevance = clamp(round((allSkills.length / 12) * 100));
  }

  /* ---------- Job-title relevance ---------- */
  const targetTitle = (d.contact.title || "").toLowerCase().trim();
  let jobTitleRelevance = 50;
  if (targetTitle) {
    const inSummary = d.summary?.toLowerCase().includes(targetTitle) ?? false;
    const inCurrent =
      d.experience.find((x) => x.current)?.role.toLowerCase().includes(targetTitle) ?? false;
    jobTitleRelevance = inCurrent ? 100 : inSummary ? 80 : 40;
  } else if (jdKeywords.length > 0) {
    jobTitleRelevance = 30;
  }

  /* ---------- Compose ---------- */
  const breakdown: AtsBreakdown = {
    structure: clamp(structure),
    formatting: clamp(formatting),
    keywords: clamp(keywords),
    experienceQuality: clamp(experienceQuality),
    measurableImpact: clamp(measurableImpact),
    readability: clamp(readability),
    density: clamp(density),
    skillsRelevance: clamp(skillsRelevance),
    jobTitleRelevance: clamp(jobTitleRelevance),
  };

  const weighted = (Object.keys(WEIGHTS) as (keyof AtsBreakdown)[]).reduce(
    (acc, k) => acc + breakdown[k] * WEIGHTS[k],
    0,
  );
  const totalPenalty = penalties.reduce((acc, p) => acc + p.points, 0);
  const score = clamp(round(weighted - totalPenalty));

  return {
    score,
    band: scoreBand(score),
    breakdown,
    matchedKeywords: matched,
    missingKeywords: missing,
    penalties,
    issues,
    wins,
  };
}

/* ============================================================== *
 *                     Keyword extraction                         *
 * ============================================================== */

/**
 * Frequency-ranked keyword extraction from a JD blob. Preserves common tech
 * tokens (C++, C#, Node.js) via the `[a-z+#.\-]` character class.
 */
export function extractKeywords(text: string, limit = 25): string[] {
  if (!text) return [];
  const counts = new Map<string, number>();
  const tokens = text.toLowerCase().match(/[a-z][a-z+#.\-]{1,}/g) ?? [];
  for (const t of tokens) {
    if (t.length < 3 || STOP_WORDS.has(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

/** Re-export band helper for convenience. */
export { scoreBand };
export type { ScoreBand };

// Silence unused-var warnings for utilities only referenced in advanced paths.
void URL_RE;