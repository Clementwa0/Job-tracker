import type { ResumeData } from "@/types/resume-builder";

const ACTION_VERBS = new Set([
  "led", "built", "launched", "shipped", "designed", "drove", "scaled", "owned",
  "reduced", "increased", "improved", "delivered", "implemented", "automated",
  "migrated", "architected", "optimized", "streamlined", "spearheaded", "developed",
  "created", "introduced", "negotiated", "produced", "managed", "mentored",
]);

const WEAK_WORDS = ["responsible for", "worked on", "helped with", "duties included", "various", "stuff", "things"];

export interface AtsResult {
  score: number;
  breakdown: {
    completeness: number;
    impact: number;
    formatting: number;
    keywords: number;
  };
  issues: string[];
  wins: string[];
}

function pct(n: number, d: number) {
  if (d <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((n / d) * 100)));
}

export function scoreResume(d: ResumeData, jdKeywords: string[] = []): AtsResult {
  const issues: string[] = [];
  const wins: string[] = [];

  // Completeness
  const contactFields = [d.contact.fullName, d.contact.email, d.contact.phone, d.contact.location];
  const contactScore = pct(contactFields.filter(Boolean).length, contactFields.length);
  const sectionScore =
    (d.summary ? 25 : 0) +
    (d.experience.length > 0 ? 35 : 0) +
    (d.education.length > 0 ? 20 : 0) +
    (d.skills.length > 0 ? 20 : 0);
  const completeness = Math.round((contactScore + sectionScore) / 2);
  if (!d.contact.email) issues.push("Missing email address.");
  if (!d.summary) issues.push("Add a professional summary.");
  if (d.experience.length === 0) issues.push("Add at least one work experience.");
  if (d.skills.length === 0) issues.push("Add a skills section.");

  // Impact: action-verb-led bullets w/ numbers
  const bullets = d.experience.flatMap((x) => x.bullets).filter((b) => b && b.trim().length > 4);
  let strongBullets = 0;
  let weakBullets = 0;
  for (const b of bullets) {
    const lower = b.toLowerCase().trim();
    const first = lower.split(/\s+/)[0]?.replace(/[^a-z]/g, "");
    const hasNumber = /\d/.test(b);
    const startsAction = first && ACTION_VERBS.has(first);
    const hasWeak = WEAK_WORDS.some((w) => lower.includes(w));
    if (startsAction && hasNumber) strongBullets++;
    if (hasWeak || (!startsAction && bullets.length > 0)) weakBullets++;
  }
  const impact = bullets.length === 0 ? 0 : pct(strongBullets, bullets.length);
  if (weakBullets > 0) issues.push(`${weakBullets} bullet${weakBullets > 1 ? "s use" : " uses"} weak language — lead with action verbs.`);
  if (strongBullets > 0) wins.push(`${strongBullets} high-impact bullet${strongBullets > 1 ? "s" : ""} with measurable outcomes.`);

  // Formatting: bullet length sanity, no excessive caps
  let formatIssues = 0;
  for (const b of bullets) {
    if (b.length > 240) formatIssues++;
    if (b === b.toUpperCase() && b.length > 12) formatIssues++;
  }
  const formatting = bullets.length === 0 ? 80 : pct(bullets.length - formatIssues, bullets.length);
  if (formatIssues > 0) issues.push(`${formatIssues} bullet${formatIssues > 1 ? "s are" : " is"} too long or ALL CAPS.`);

  // Keywords: against optional JD list
  const resumeText = [
    d.summary,
    ...d.experience.flatMap((x) => [x.role, x.company, ...x.bullets]),
    ...d.projects.flatMap((p) => [p.name, p.description, ...p.tech]),
    ...d.skills.flatMap((s) => s.items),
  ]
    .join(" ")
    .toLowerCase();
  let keywords = 100;
  let matched: string[] = [];
  let missing: string[] = [];
  if (jdKeywords.length > 0) {
    matched = jdKeywords.filter((k) => resumeText.includes(k.toLowerCase()));
    missing = jdKeywords.filter((k) => !resumeText.includes(k.toLowerCase()));
    keywords = pct(matched.length, jdKeywords.length);
    if (missing.length > 0) issues.push(`Missing ${missing.length} JD keyword${missing.length > 1 ? "s" : ""}: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}`);
    if (matched.length > 0) wins.push(`${matched.length} JD keyword${matched.length > 1 ? "s" : ""} matched.`);
  }

  const score = Math.round(completeness * 0.3 + impact * 0.3 + formatting * 0.2 + keywords * 0.2);

  return {
    score,
    breakdown: { completeness, impact, formatting, keywords },
    issues,
    wins,
  };
}

/** Naive keyword extraction for JD strings */
export function extractKeywords(text: string, limit = 25): string[] {
  if (!text) return [];
  const stop = new Set([
    "the", "and", "for", "with", "you", "your", "our", "are", "will", "have",
    "this", "that", "from", "into", "team", "work", "must", "role", "job",
    "candidate", "should", "able", "year", "years", "experience", "etc",
    "including", "ability", "strong", "good", "great", "plus", "of", "in", "to",
    "a", "an", "or", "is", "be", "by", "as", "on", "at", "we",
  ]);
  const counts = new Map<string, number>();
  const tokens = text.toLowerCase().match(/[a-z][a-z+#.\-]{1,}/g) || [];
  for (const t of tokens) {
    if (t.length < 3 || stop.has(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}
