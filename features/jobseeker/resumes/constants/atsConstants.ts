/**
 * ATS scoring constants. Kept outside components and the scoring function so
 * they are created exactly once per module load instead of on every call.
 */

/** Verbs ATS recruiters expect at the start of a bullet. */
export const ACTION_VERBS: ReadonlySet<string> = new Set([
  "accelerated", "achieved", "architected", "automated", "boosted", "built",
  "centralized", "championed", "consolidated", "converted", "created", "cut",
  "delivered", "deployed", "designed", "developed", "directed", "doubled",
  "drove", "eliminated", "engineered", "established", "expanded", "generated",
  "grew", "headed", "implemented", "improved", "increased", "initiated",
  "introduced", "launched", "led", "managed", "mentored", "migrated",
  "negotiated", "optimized", "orchestrated", "owned", "pioneered", "produced",
  "reduced", "refactored", "rolled", "saved", "scaled", "shipped", "simplified",
  "spearheaded", "standardized", "streamlined", "transformed", "tripled",
]);

/** Phrases that signal weak, passive, or duty-listing bullets. */
export const WEAK_PHRASES: readonly string[] = [
  "responsible for", "worked on", "helped with", "duties included",
  "tasks included", "in charge of", "assisted with", "involved in",
  "participated in", "various", "stuff", "things",
];

/** Token stopwords for keyword extraction. */
export const STOP_WORDS: ReadonlySet<string> = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "have",
  "this", "that", "from", "into", "team", "work", "must", "role", "job",
  "candidate", "should", "able", "year", "years", "experience", "etc",
  "including", "ability", "strong", "good", "great", "plus", "of", "in", "to",
  "a", "an", "or", "is", "be", "by", "as", "on", "at", "we", "any", "all",
  "who", "what", "when", "where", "how", "such", "than", "their", "them",
  "they", "those", "these", "while", "about", "across", "via", "per",
]);

/** Markers commonly missed by ATS parsers — we penalize their presence. */
export const ATS_UNFRIENDLY_TOKENS: readonly string[] = [
  "★", "✓", "✔", "✗", "→", "►", "▪", "■", "●", "◆", "❖", "✦",
];

/** Recommended structural sections that improve ATS parsing. */
export const RECOMMENDED_SECTIONS = [
  "summary", "experience", "education", "skills",
] as const;

/** Soft target ranges for total bullets and total word count. */
export const RESUME_LENGTH_TARGET = {
  minWords: 350,
  maxWords: 950,
  minBullets: 6,
  maxBullets: 24,
} as const;

/** Score band labels surfaced to the UI. */
export type ScoreBand = "Excellent" | "Strong" | "Good" | "Average" | "Weak";

export function scoreBand(score: number): ScoreBand {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  return "Weak";
}