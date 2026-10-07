import type { CandidateSignals } from "@/lib/recommendations/scoring";
import type { JobseekerProfile } from "@/types/profile";

export interface JobseekerContext {
  user: { name: string; email: string; emailVerified: boolean; picture: string | null };
  profile: JobseekerProfile;
}

const dedupe = (values: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value.trim());
  }
  return out;
};

export function buildCandidateSignals(ctx: JobseekerContext): CandidateSignals {
  const { profile } = ctx;
  return {
    skills: dedupe(profile.skills),
    roles: profile.targetRoles.length > 0 ? profile.targetRoles : [profile.headline].filter(Boolean),
    location: profile.location,
    preferredLocations: profile.preferredLocations,
    workModes: profile.preferredWorkModes,
    jobTypes: profile.preferredJobTypes,
    yearsExperience: profile.yearsExperience,
    salaryMin: profile.expectedSalaryMin,
    salaryMax: profile.expectedSalaryMax,
    salaryCurrency: profile.salaryCurrency || "KES",
  };
}
