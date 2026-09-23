/** Jobseeker profile, preferences, completeness and recommendation shapes (API ⇄ UI). */

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  currentlyStudying: boolean;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

export interface WorkExperienceEntry {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface JobseekerProfile {
  headline: string;
  location: string;
  phone: string;
  bio: string;
  website: string;
  linkedinUrl: string;
  githubUrl: string;
  yearsExperience: number | null;
  skills: string[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  workExperience: WorkExperienceEntry[];
  targetRoles: string[];
  preferredLocations: string[];
  preferredJobTypes: string[];
  preferredWorkModes: string[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  salaryCurrency: string;
}

export interface CompletenessItem {
  key: string;
  label: string;
  done: boolean;
  /** Share of the 100% this item is worth. */
  weight: number;
}

export interface ProfileCompleteness {
  percentage: number;
  items: CompletenessItem[];
}

export interface ProfileResponse {
  name: string;
  email: string;
  picture: string | null;
  profile: JobseekerProfile;
  completeness: ProfileCompleteness;
}

export interface RecommendedJob {
  id: string;
  slug: string;
  title: string;
  company: { name: string; logo: string };
  location: string;
  jobType: string;
  workMode: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  applicationDeadline: string | null;
  /** Whole days until the deadline (0 = today); null if the posting has none. */
  daysLeft: number | null;
  publishedAt: string | null;
  /** 0–100. */
  matchScore: number;
  matchedSkills: string[];
  /** Human-readable reasons behind the score, strongest first. */
  reasons: string[];
}

export interface RecommendationsResponse {
  jobs: RecommendedJob[];
  /**
   * ready: enough profile data to score (skills or target roles present).
   * When false the UI should ask the user to fill those in.
   */
  ready: boolean;
}
