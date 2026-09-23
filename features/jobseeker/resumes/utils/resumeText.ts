import type { ResumeData } from "@/types/resume-builder";

/**
 * Flatten a ResumeData into a single plain-text blob. Centralized so the AI
 * services, JD matcher, and ATS scorer all see the same canonical text.
 */
export function resumeToPlainText(d: ResumeData): string {
  const parts: string[] = [
    d.contact.fullName,
    d.contact.title,
    d.summary,
  ];

  for (const x of d.experience) {
    parts.push(`${x.role} — ${x.company}`);
    for (const b of x.bullets) parts.push(b);
  }
  for (const p of d.projects) {
    parts.push(p.name, p.description, p.tech.join(", "));
  }
  for (const e of d.education) {
    parts.push(`${e.degree} ${e.field} — ${e.school}`, e.notes);
  }
  for (const s of d.skills) {
    parts.push(`${s.category}: ${s.items.join(", ")}`);
  }

  return parts.filter(Boolean).join("\n");
}

/** Word count, normalized. */
export function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Escape a string for safe use inside a RegExp. Used by the keyword matcher to
 * support tokens with `+`, `#`, `.`, `-` (e.g. C++, C#, Node.js, CI/CD).
 */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Word-boundary keyword matcher. `text` is matched case-insensitively. For
 * tokens containing non-word characters (C++, C#, .NET) we relax the trailing
 * boundary so the regex still fires.
 */
export function keywordMatches(text: string, keyword: string): boolean {
  const kw = keyword.trim();
  if (!kw) return false;
  const escaped = escapeRegExp(kw);
  // Use lookarounds so symbols at the edge of a token don't break matching.
  const re = new RegExp(`(?:^|[^\\w+#.\\-])${escaped}(?:$|[^\\w+#.\\-])`, "i");
  return re.test(text);
}