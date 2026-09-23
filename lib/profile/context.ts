import type { CandidateSignals } from "@/lib/recommendations/scoring";
import type { JobseekerProfile } from "@/types/profile";
import { yearsOfExperience } from "@/lib/profile/experience";

/** Facts pulled from a resume's JSON sections. */
export interface ResumeFacts {
  title: string;
  summary: string;
  location: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  skills: string[];
  experienceCount: number;
  educationCount: number;
  /** Derived from experience dates; null if they can't be parsed. */
  years: number | null;
}

/** The slice of a `resumes` row this module reads. */
export interface ResumeRowLike {
  contact: Record<string, unknown>;
  summary: string;
  experience: unknown[];
  education: unknown[];
  skills: unknown[];
  updatedAt: Date;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export function resumeFacts(row: ResumeRowLike, now: Date = new Date()): ResumeFacts {
  const contact = isRecord(row.contact) ? row.contact : {};

  // Blank template rows (added but never filled in) shouldn't count.
  const experience = row.experience.filter(isRecord).filter((e) => str(e.role) || str(e.company));
  const education = row.education.filter(isRecord).filter((e) => str(e.school) || str(e.degree));

  const skills = row.skills
    .filter(isRecord)
    .flatMap((group) => (Array.isArray(group.items) ? group.items : []))
    .map(str)
    .filter(Boolean);

  return {
    title: str(contact.title),
    summary: str(row.summary),
    location: str(contact.location),
    phone: str(contact.phone),
    website: str(contact.website),
    linkedin: str(contact.linkedin),
    github: str(contact.github),
    skills,
    experienceCount: experience.length,
    educationCount: education.length,
    years: yearsOfExperience(experience, now),
  };
}

/**
 * The resume that best represents the user's background: the one with the
 * most substantive content, most recently edited winning ties. Using one
 * resume (rather than summing) avoids double-counting when they keep several
 * tailored versions of the same CV.
 */
export function pickBestResume<T extends ResumeRowLike>(rows: T[], now: Date = new Date()): ResumeFacts | null {
  let best: { facts: ResumeFacts; richness: number; updatedAt: number } | null = null;

  for (const row of rows) {
    const facts = resumeFacts(row, now);
    const richness =
      facts.experienceCount + facts.educationCount + facts.skills.length + (facts.summary ? 1 : 0);
    const updatedAt = row.updatedAt.getTime();
    if (
      !best ||
      richness > best.richness ||
      (richness === best.richness && updatedAt > best.updatedAt)
    ) {
      best = { facts, richness, updatedAt };
    }
  }
  return best?.facts ?? null;
}

export interface JobseekerContext {
  user: { name: string; email: string; emailVerified: boolean; picture: string | null };
  profile: JobseekerProfile;
  resume: ResumeFacts | null;
}

const dedupe = (values: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
};

/** Merges profile + resume into the inputs the match scorer works from. */
export function buildCandidateSignals(ctx: JobseekerContext): CandidateSignals {
  const { profile, resume } = ctx;

  // Explicit target roles win; otherwise fall back to how they describe themselves.
  const roles =
    profile.targetRoles.length > 0
      ? profile.targetRoles
      : [profile.headline, resume?.title ?? ""].filter((r) => r.trim());

  return {
    skills: dedupe([...profile.skills, ...(resume?.skills ?? [])]),
    roles,
    location: profile.location || resume?.location || "",
    preferredLocations: profile.preferredLocations,
    workModes: profile.preferredWorkModes,
    jobTypes: profile.preferredJobTypes,
    yearsExperience: profile.yearsExperience ?? resume?.years ?? null,
    salaryMin: profile.expectedSalaryMin,
    salaryMax: profile.expectedSalaryMax,
    salaryCurrency: profile.salaryCurrency || "KES",
  };
}
