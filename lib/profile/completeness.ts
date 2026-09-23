import type { CompletenessItem, ProfileCompleteness } from "@/types/profile";

/**
 * Everything the completeness score looks at, already merged from the user
 * row, their candidate profile and their resumes by the caller.
 */
export interface CompletenessInput {
  user: {
    name: string;
    email: string;
    emailVerified: boolean;
    picture: string | null;
  };
  profile: {
    headline: string;
    bio: string;
    location: string;
    phone: string;
    website: string;
    linkedinUrl: string;
    githubUrl: string;
    yearsExperience: number | null;
    skills: string[];
    targetRoles: string[];
    preferredLocations: string[];
    preferredJobTypes: string[];
    preferredWorkModes: string[];
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
  };
  /** Facts about the user's most complete resume; null when they have none. */
  resume: {
    summary: string;
    title: string;
    location: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
    skills: string[];
    experienceCount: number;
    educationCount: number;
  } | null;
  /** Skill threshold that counts as "skills added". */
  minSkills?: number;
}

const filled = (v: string | null | undefined) => Boolean(v && v.trim());

export const MIN_SKILLS = 3;

/**
 * Weighted, data-driven completeness. Each item is done or not (so the
 * checklist in the UI is honest about what's missing) and carries a weight;
 * the percentage is the weight of what's done. Weights sum to 100.
 *
 * Profile fields fall back to the same field on the resume, so information
 * the user already entered once isn't demanded again.
 */
export function computeCompleteness(input: CompletenessInput): ProfileCompleteness {
  const { user, profile, resume } = input;
  const minSkills = input.minSkills ?? MIN_SKILLS;

  const allSkills = new Set(
    [...profile.skills, ...(resume?.skills ?? [])]
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );

  const hasLink = [
    profile.website,
    profile.linkedinUrl,
    profile.githubUrl,
    resume?.website,
    resume?.linkedin,
    resume?.github,
  ].some(filled);

  const hasWorkPrefs =
    profile.preferredJobTypes.length > 0 ||
    profile.preferredWorkModes.length > 0 ||
    profile.preferredLocations.length > 0;

  const items: CompletenessItem[] = [
    {
      key: "personal",
      label: "Personal information",
      done: filled(user.name) && filled(user.email),
      weight: 5,
    },
    { key: "verified", label: "Email verified", done: user.emailVerified, weight: 5 },
    { key: "photo", label: "Add profile photo", done: filled(user.picture), weight: 5 },
    {
      key: "headline",
      label: "Professional headline",
      done: [profile.headline, profile.bio, resume?.summary, resume?.title].some(filled),
      weight: 10,
    },
    {
      key: "location",
      label: "Location",
      done: filled(profile.location) || filled(resume?.location),
      weight: 5,
    },
    {
      key: "phone",
      label: "Phone number",
      done: filled(profile.phone) || filled(resume?.phone),
      weight: 5,
    },
    { key: "resume", label: "Resume added", done: resume !== null, weight: 15 },
    {
      key: "skills",
      label: `Skills (${minSkills}+)`,
      done: allSkills.size >= minSkills,
      weight: 10,
    },
    {
      key: "experience",
      label: "Work experience",
      done: (resume?.experienceCount ?? 0) > 0 || profile.yearsExperience !== null,
      weight: 10,
    },
    {
      key: "education",
      label: "Education",
      done: (resume?.educationCount ?? 0) > 0,
      weight: 5,
    },
    { key: "links", label: "Portfolio / profile links", done: hasLink, weight: 5 },
    {
      key: "roles",
      label: "Target roles",
      done: profile.targetRoles.length > 0,
      weight: 8,
    },
    { key: "workPrefs", label: "Job type, work mode or location preferences", done: hasWorkPrefs, weight: 6 },
    {
      key: "salary",
      label: "Salary expectation",
      done: profile.expectedSalaryMin !== null || profile.expectedSalaryMax !== null,
      weight: 6,
    },
  ];

  const total = items.reduce((sum, i) => sum + i.weight, 0);
  const earned = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);

  return { percentage: Math.round((earned / total) * 100), items };
}
