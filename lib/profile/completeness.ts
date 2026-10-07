import type { CompletenessItem, ProfileCompleteness } from "@/types/profile";

export interface CompletenessInput {
  user: { name: string; email: string; emailVerified: boolean; picture: string | null };
  profile: {
    headline: string; bio: string; location: string; phone: string; website: string;
    linkedinUrl: string; githubUrl: string; yearsExperience: number | null;
    skills: string[]; education: unknown[]; workExperience: unknown[]; certifications: unknown[];
    targetRoles: string[]; preferredLocations: string[]; preferredJobTypes: string[];
    preferredWorkModes: string[]; expectedSalaryMin: number | null; expectedSalaryMax: number | null;
  };
  minSkills?: number;
}

const filled = (value: string | null | undefined) => Boolean(value && value.trim());
export const MIN_SKILLS = 3;

export function computeCompleteness(input: CompletenessInput): ProfileCompleteness {
  const { user, profile } = input;
  const minSkills = input.minSkills ?? MIN_SKILLS;
  const items: CompletenessItem[] = [
    { key: "personal", label: "Personal information", done: filled(user.name) && filled(user.email), weight: 8 },
    { key: "verified", label: "Email verified", done: user.emailVerified, weight: 6 },
    { key: "photo", label: "Add profile photo", done: filled(user.picture), weight: 6 },
    { key: "headline", label: "Professional headline", done: filled(profile.headline) || filled(profile.bio), weight: 12 },
    { key: "location", label: "Location", done: filled(profile.location), weight: 6 },
    { key: "phone", label: "Phone number", done: filled(profile.phone), weight: 6 },
    { key: "skills", label: `Skills (${minSkills}+)`, done: new Set(profile.skills.map((s) => s.trim().toLowerCase()).filter(Boolean)).size >= minSkills, weight: 12 },
    { key: "experience", label: "Work experience", done: profile.workExperience.length > 0 || profile.yearsExperience !== null, weight: 12 },
    { key: "education", label: "Education", done: profile.education.length > 0, weight: 8 },
    { key: "certifications", label: "Certifications", done: profile.certifications.length > 0, weight: 4 },
    { key: "links", label: "Portfolio / profile links", done: [profile.website, profile.linkedinUrl, profile.githubUrl].some(filled), weight: 5 },
    { key: "roles", label: "Target roles", done: profile.targetRoles.length > 0, weight: 6 },
    { key: "workPrefs", label: "Job type, work mode or location preferences", done: profile.preferredJobTypes.length > 0 || profile.preferredWorkModes.length > 0 || profile.preferredLocations.length > 0, weight: 5 },
    { key: "salary", label: "Salary expectation", done: profile.expectedSalaryMin !== null || profile.expectedSalaryMax !== null, weight: 4 },
  ];
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const earned = items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return { percentage: Math.round((earned / total) * 100), items };
}
