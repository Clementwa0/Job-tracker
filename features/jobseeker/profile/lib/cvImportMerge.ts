import { yearsOfExperience } from "@/lib/profile/experience";
import type { CertificationEntry, EducationEntry, ParsedCv, WorkExperienceEntry } from "@/types/profile";

/**
 * Pure logic for the CV import review: turns a parsed CV plus the current
 * form values into reviewable items (with duplicate/conflict detection), and
 * turns the user's selection back into a safe merge. No React, no I/O.
 */

export const MAX_PROFILE_SKILLS = 40;
export const MAX_STRUCTURED_ENTRIES = 40;

/** The form's current values, in the same shapes the profile API uses. */
export interface ProfileSnapshot {
  name: string;
  headline: string;
  location: string;
  phone: string;
  bio: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
  /** Raw form text ("" when unset). */
  years: string;
  skills: string[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  workExperience: WorkExperienceEntry[];
  targetRoles: string[];
}

export type ScalarKey = "name" | "headline" | "location" | "phone" | "bio" | "website" | "linkedinUrl" | "githubUrl";

export interface ReviewItem<T = string> {
  id: string;
  label: string;
  detail?: string;
  value: T;
  /** Already in the profile (or repeated in the CV). Unselected by default. */
  duplicate: boolean;
  /** Differs from a non-empty current value; importing would replace it. */
  conflictWith?: string;
  selected: boolean;
}

export interface CvImportReview {
  personal: Array<ReviewItem<string> & { key: ScalarKey }>;
  /** CV email is shown for reference only - the account email is never changed. */
  cvEmail: string;
  summary: ReviewItem<string> | null;
  skills: ReviewItem<string>[];
  experience: ReviewItem<WorkExperienceEntry>[];
  education: ReviewItem<EducationEntry>[];
  certifications: ReviewItem<CertificationEntry>[];
  targetRoles: ReviewItem<string>[];
  years: ReviewItem<null> | null;
  warnings: string[];
}

export type ReviewSection = "personal" | "summary" | "skills" | "experience" | "education" | "certifications" | "targetRoles" | "years";

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const sameOrEitherEmpty = (a: string, b: string) => !norm(a) || !norm(b) || norm(a) === norm(b);

export const sameExperience = (a: WorkExperienceEntry, b: WorkExperienceEntry) =>
  norm(a.company) === norm(b.company) &&
  norm(a.jobTitle) === norm(b.jobTitle) &&
  (!a.startDate || !b.startDate || a.startDate === b.startDate);

export const sameEducation = (a: EducationEntry, b: EducationEntry) =>
  norm(a.institution) === norm(b.institution) &&
  norm(a.degree) === norm(b.degree) &&
  sameOrEitherEmpty(a.fieldOfStudy, b.fieldOfStudy);

export const sameCertification = (a: CertificationEntry, b: CertificationEntry) =>
  norm(a.name) === norm(b.name) && sameOrEitherEmpty(a.issuer, b.issuer);

/** Marks each candidate as duplicate of the existing entries or of an earlier candidate. */
function withDuplicateFlags<T>(existing: T[], incoming: T[], same: (a: T, b: T) => boolean): boolean[] {
  return incoming.map((item, index) => existing.some((e) => same(e, item)) || incoming.slice(0, index).some((e) => same(e, item)));
}

const join = (...parts: string[]) => parts.filter(Boolean).join(" · ");
const period = (start: string, end: string, current: boolean, presentLabel: string) =>
  [start, current ? presentLabel : end].filter(Boolean).join(" – ");

export function cvToExperience(cv: ParsedCv): WorkExperienceEntry[] {
  return cv.experience.map((item) => ({
    jobTitle: item.role,
    company: item.company,
    location: item.location,
    startDate: item.startDate,
    endDate: item.current ? "" : item.endDate,
    currentlyWorking: item.current,
    description: item.bullets.join("\n"),
  }));
}

export function cvToEducation(cv: ParsedCv): EducationEntry[] {
  return cv.education.map((item) => ({
    institution: item.school,
    degree: item.degree,
    fieldOfStudy: item.field,
    startDate: item.startDate,
    endDate: item.endDate,
    currentlyStudying: item.current,
  }));
}

export function cvToCertifications(cv: ParsedCv): CertificationEntry[] {
  // Only what the CV states: no invented expiry dates, credential IDs or issuers.
  return cv.certifications.map((item) => ({
    name: item.name,
    issuer: item.issuer,
    issueDate: item.date,
    expiryDate: "",
    credentialId: "",
    credentialUrl: item.url,
  }));
}

/** Whole years of work history with overlapping jobs counted once; null when undeterminable. */
export function calculateYears(experience: WorkExperienceEntry[]): number | null {
  const years = yearsOfExperience(
    experience.map((e) => ({ startDate: e.startDate, endDate: e.endDate, current: e.currentlyWorking })),
  );
  return years === null ? null : Math.floor(years);
}

const isSelected = (item: { selected: boolean }) => item.selected;

export function buildImportReview(cv: ParsedCv, current: ProfileSnapshot): CvImportReview {
  const scalar = (key: ScalarKey, label: string, value: string, existing: string) => {
    if (!value) return null;
    const differs = Boolean(existing.trim()) && existing.trim() !== value.trim();
    return {
      id: `personal:${key}`,
      key,
      label,
      value,
      duplicate: existing.trim() === value.trim(),
      conflictWith: differs ? existing : undefined,
      // A different existing value is never replaced unless the user opts in.
      selected: !existing.trim(),
    };
  };

  const personal = [
    scalar("name", "Full name", cv.contact.fullName, current.name),
    scalar("headline", "Professional title", cv.contact.title, current.headline),
    scalar("location", "Location", cv.contact.location, current.location),
    scalar("phone", "Phone", cv.contact.phone, current.phone),
    scalar("website", "Website", cv.contact.website, current.website),
    scalar("linkedinUrl", "LinkedIn", cv.contact.linkedin, current.linkedinUrl),
    scalar("githubUrl", "GitHub", cv.contact.github, current.githubUrl),
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const summaryScalar = scalar("bio", "Professional summary", cv.summary, current.bio);
  const summary: ReviewItem<string> | null = summaryScalar
    ? { ...summaryScalar, id: "summary:bio" }
    : null;

  const existingSkills = new Set(current.skills.map((s) => s.toLowerCase()));
  const seenSkills = new Set<string>();
  const skills = cv.skills.map((skill, index) => {
    const key = skill.toLowerCase();
    const duplicate = existingSkills.has(key) || seenSkills.has(key);
    seenSkills.add(key);
    return { id: `skills:${index}`, label: skill, value: skill, duplicate, selected: !duplicate };
  });

  const experienceValues = cvToExperience(cv);
  const experienceDupes = withDuplicateFlags(current.workExperience, experienceValues, sameExperience);
  const experience = experienceValues.map((value, index) => ({
    id: `experience:${index}`,
    label: join(value.jobTitle, value.company) || "Work experience",
    detail: join(
      period(value.startDate, value.endDate, value.currentlyWorking, "Present"),
      value.location,
      value.description ? `${value.description.split("\n").length} bullet point(s)` : "",
    ),
    value,
    duplicate: experienceDupes[index],
    selected: !experienceDupes[index],
  }));

  const educationValues = cvToEducation(cv);
  const educationDupes = withDuplicateFlags(current.education, educationValues, sameEducation);
  const education = educationValues.map((value, index) => ({
    id: `education:${index}`,
    label: join(value.degree, value.fieldOfStudy) || value.institution || "Education",
    detail: join(value.degree || value.fieldOfStudy ? value.institution : "", period(value.startDate, value.endDate, value.currentlyStudying, "Present")),
    value,
    duplicate: educationDupes[index],
    selected: !educationDupes[index],
  }));

  const certificationValues = cvToCertifications(cv);
  const certificationDupes = withDuplicateFlags(current.certifications, certificationValues, sameCertification);
  const certifications = certificationValues.map((value, index) => ({
    id: `certifications:${index}`,
    label: value.name,
    detail: join(value.issuer, value.issueDate),
    value,
    duplicate: certificationDupes[index],
    selected: !certificationDupes[index],
  }));

  const existingRoles = new Set(current.targetRoles.map((r) => r.toLowerCase()));
  const targetRoles = cv.targetRoles.map((role, index) => ({
    id: `targetRoles:${index}`,
    label: role,
    detail: "Stated in your CV as a role you're seeking",
    value: role,
    duplicate: existingRoles.has(role.toLowerCase()),
    // Preferences are the user's call, so even explicit roles start unselected.
    selected: false,
  }));

  const review: CvImportReview = {
    personal,
    cvEmail: cv.contact.email,
    summary,
    skills,
    experience,
    education,
    certifications,
    targetRoles,
    years: null,
    warnings: cv.warnings,
  };

  const years = calculateYears([...current.workExperience, ...experience.filter(isSelected).map((i) => i.value)]);
  if (years !== null) {
    const existing = current.years.trim();
    const differs = existing !== "" && existing !== String(years);
    review.years = {
      id: "years:years",
      label: "Years of experience",
      value: null,
      duplicate: existing === String(years),
      conflictWith: differs ? existing : undefined,
      selected: existing === "",
    };
  }
  return review;
}

/** Updates the review's selection state immutably. */
export function setItemSelected(review: CvImportReview, id: string, selected: boolean): CvImportReview {
  const map = <T extends { id: string; selected: boolean }>(items: T[]) =>
    items.map((item) => (item.id === id ? { ...item, selected } : item));
  return {
    ...review,
    personal: map(review.personal),
    summary: review.summary && review.summary.id === id ? { ...review.summary, selected } : review.summary,
    skills: map(review.skills),
    experience: map(review.experience),
    education: map(review.education),
    certifications: map(review.certifications),
    targetRoles: map(review.targetRoles),
    years: review.years && review.years.id === id ? { ...review.years, selected } : review.years,
  };
}

export function setSectionSelected(review: CvImportReview, section: ReviewSection, selected: boolean): CvImportReview {
  const set = <T extends { selected: boolean }>(items: T[]) => items.map((item) => ({ ...item, selected }));
  switch (section) {
    case "personal": return { ...review, personal: set(review.personal) };
    case "summary": return { ...review, summary: review.summary && { ...review.summary, selected } };
    case "skills": return { ...review, skills: set(review.skills) };
    case "experience": return { ...review, experience: set(review.experience) };
    case "education": return { ...review, education: set(review.education) };
    case "certifications": return { ...review, certifications: set(review.certifications) };
    case "targetRoles": return { ...review, targetRoles: set(review.targetRoles) };
    case "years": return { ...review, years: review.years && { ...review.years, selected } };
  }
}

export function countSelected(review: CvImportReview): number {
  return (
    review.personal.filter(isSelected).length +
    (review.summary?.selected ? 1 : 0) +
    review.skills.filter(isSelected).length +
    review.experience.filter(isSelected).length +
    review.education.filter(isSelected).length +
    review.certifications.filter(isSelected).length +
    review.targetRoles.filter(isSelected).length +
    (review.years?.selected ? 1 : 0)
  );
}

/** Years the review would set given the current selection (live preview). */
export function previewYears(review: CvImportReview, current: ProfileSnapshot): number | null {
  return calculateYears([...current.workExperience, ...review.experience.filter(isSelected).map((i) => i.value)]);
}

export interface ImportApplyResult {
  /** Only the fields the import changes; everything else stays as it is. */
  patch: Partial<ProfileSnapshot>;
  notes: string[];
}

/**
 * Merges the selected items into the current values. Existing data is kept;
 * selected items are added (or, for single-value fields the user explicitly
 * ticked, replaced). Nothing is saved here - the caller puts this in the form.
 */
export function applyImportReview(review: CvImportReview, current: ProfileSnapshot): ImportApplyResult {
  const patch: Partial<ProfileSnapshot> = {};
  const notes: string[] = [];

  for (const item of review.personal) if (item.selected) patch[item.key] = item.value;
  if (review.summary?.selected) patch.bio = review.summary.value;

  const chosenSkills = review.skills.filter(isSelected).map((i) => i.value);
  if (chosenSkills.length) {
    const merged = [...new Map([...current.skills, ...chosenSkills].map((s) => [s.toLowerCase(), s])).values()];
    patch.skills = merged.slice(0, MAX_PROFILE_SKILLS);
    if (merged.length > MAX_PROFILE_SKILLS) {
      notes.push(`Profiles can hold ${MAX_PROFILE_SKILLS} skills, so ${merged.length - MAX_PROFILE_SKILLS} imported skill(s) were left out.`);
    }
  }

  const append = <T,>(existing: T[], chosen: T[], label: string): T[] | undefined => {
    if (!chosen.length) return undefined;
    const merged = [...existing, ...chosen];
    if (merged.length > MAX_STRUCTURED_ENTRIES) {
      notes.push(`Only ${MAX_STRUCTURED_ENTRIES} ${label} entries can be kept, so some imported entries were left out.`);
    }
    return merged.slice(0, MAX_STRUCTURED_ENTRIES);
  };

  const experience = append(current.workExperience, review.experience.filter(isSelected).map((i) => i.value), "work experience");
  if (experience) patch.workExperience = experience;
  const education = append(current.education, review.education.filter(isSelected).map((i) => i.value), "education");
  if (education) patch.education = education;
  const certifications = append(current.certifications, review.certifications.filter(isSelected).map((i) => i.value), "certification");
  if (certifications) patch.certifications = certifications;

  const chosenRoles = review.targetRoles.filter(isSelected).map((i) => i.value);
  if (chosenRoles.length) {
    patch.targetRoles = [...new Map([...current.targetRoles, ...chosenRoles].map((r) => [r.toLowerCase(), r])).values()];
  }

  if (review.years?.selected) {
    const years = calculateYears(experience ?? current.workExperience);
    if (years !== null) patch.years = String(years);
  }
  return { patch, notes };
}
