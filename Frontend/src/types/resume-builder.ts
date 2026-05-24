export interface ResumeContact {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  url: string;
  description: string;
  tech: string[];
}

export interface ResumeSkillsGroup {
  id: string;
  category: string;
  items: string[];
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: string; // e.g. "Native", "Fluent", "B2"
}

export type ResumeTemplate = "modern" | "classic" | "compact" | "executive" | "minimal";

export interface ResumeMeta {
  id: string;
  name: string; // e.g. "Backend roles 2026"
  createdAt: number;
  updatedAt: number;
}

export interface ResumeData {
  meta?: ResumeMeta;
  template: ResumeTemplate;
  accent: string;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skills: ResumeSkillsGroup[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
}

export const EMPTY_RESUME: ResumeData = {
  template: "modern",
  accent: "#2563eb",
  contact: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Merge a partial / legacy resume payload into a full ResumeData.
 * Tolerates missing arrays and missing meta — used by importJSON
 * and the AI parser response.
 */
export function normalizeResume(partial: Partial<ResumeData> & Record<string, unknown>): ResumeData {
  const ensureId = <T extends { id?: string }>(arr: T[] | undefined): (T & { id: string })[] =>
    (arr || []).map((x) => ({ ...x, id: x.id || uid() }));
  return {
    ...EMPTY_RESUME,
    ...partial,
    contact: { ...EMPTY_RESUME.contact, ...(partial.contact || {}) },
    experience: ensureId(partial.experience as ResumeExperience[] | undefined).map((e) => ({
      ...e,
      bullets: Array.isArray(e.bullets) ? e.bullets : [],
    })),
    education: ensureId(partial.education as ResumeEducation[] | undefined),
    projects: ensureId(partial.projects as ResumeProject[] | undefined).map((p) => ({
      ...p,
      tech: Array.isArray(p.tech) ? p.tech : [],
    })),
    skills: ensureId(partial.skills as ResumeSkillsGroup[] | undefined).map((s) => ({
      ...s,
      items: Array.isArray(s.items) ? s.items : [],
    })),
    certifications: ensureId(partial.certifications as ResumeCertification[] | undefined),
    languages: ensureId(partial.languages as ResumeLanguage[] | undefined),
  };
}
