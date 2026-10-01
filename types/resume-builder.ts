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
  level: string;
}

export type ResumeTemplate =
  | "aurora"
  | "atlas"
  | "vertex"
  | "horizon"
  | "mono"
  | "impact";

export interface ResumeMeta {
  id: string;
  name: string;
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
  template: "aurora",
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

export function normalizeResume(partial?: Partial<ResumeData> & Record<string, unknown>): ResumeData {
  const source = partial || {};
  const ensureId = <T extends { id?: string }>(items: T[] | undefined) =>
    (Array.isArray(items) ? items : []).map((item) => ({ ...item, id: item.id || uid() }));

  return {
    ...EMPTY_RESUME,
    ...source,
    template: ["aurora", "atlas", "vertex", "horizon", "mono", "impact"].includes(String(source.template))
      ? (source.template as ResumeTemplate)
      : "aurora",
    contact: { ...EMPTY_RESUME.contact, ...(source.contact || {}) },
    experience: ensureId(source.experience as ResumeExperience[] | undefined).map((x) => ({ ...x, bullets: Array.isArray(x.bullets) ? x.bullets : [] })),
    education: ensureId(source.education as ResumeEducation[] | undefined),
    projects: ensureId(source.projects as ResumeProject[] | undefined).map((x) => ({ ...x, tech: Array.isArray(x.tech) ? x.tech : [] })),
    skills: ensureId(source.skills as ResumeSkillsGroup[] | undefined).map((x) => ({ ...x, items: Array.isArray(x.items) ? x.items : [] })),
    certifications: ensureId(source.certifications as ResumeCertification[] | undefined),
    languages: ensureId(source.languages as ResumeLanguage[] | undefined),
  };
}
