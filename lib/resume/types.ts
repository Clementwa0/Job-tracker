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
export type ResumeTemplate = "aurora" | "atlas" | "vertex" | "horizon" | "mono" | "impact";
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

export const TEMPLATES: { id: ResumeTemplate; name: string; tagline: string; accent: string }[] = [
  { id: "aurora", name: "Aurora", tagline: "Modern professional", accent: "#2563eb" },
  { id: "atlas", name: "Atlas", tagline: "Technical two-column", accent: "#0f766e" },
  { id: "vertex", name: "Vertex", tagline: "Developer / technology", accent: "#16a34a" },
  { id: "horizon", name: "Horizon", tagline: "Executive / corporate", accent: "#7c2d12" },
  { id: "mono", name: "Mono", tagline: "Minimal, ATS-focused", accent: "#111827" },
  { id: "impact", name: "Impact", tagline: "Achievement-focused", accent: "#dc2626" },
];

export const ACCENTS = ["#2563eb", "#0f766e", "#16a34a", "#7c2d12", "#111827", "#dc2626", "#9333ea", "#c2410c"];

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const EMPTY_RESUME: ResumeData = {
  template: "aurora",
  accent: "#2563eb",
  contact: { fullName: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
};

const TEMPLATE_IDS = TEMPLATES.map((t) => t.id) as string[];

export function normalizeResume(partial?: Partial<ResumeData> & Record<string, unknown>): ResumeData {
  const s = partial || {};
  const ensure = <T extends { id?: string }>(items: unknown) =>
    (Array.isArray(items) ? (items as T[]) : []).map((i) => ({ ...i, id: i.id || uid() }));
  const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
  const arr = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
  return {
    ...EMPTY_RESUME,
    ...(s.meta ? { meta: s.meta } : {}),
    template: TEMPLATE_IDS.includes(String(s.template)) ? (s.template as ResumeTemplate) : "aurora",
    accent: typeof s.accent === "string" && /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : EMPTY_RESUME.accent,
    summary: str(s.summary),
    contact: { ...EMPTY_RESUME.contact, ...((s.contact as object) || {}) },
    experience: ensure<ResumeExperience>(s.experience).map((x) => ({
      ...x, company: str(x.company), role: str(x.role), location: str(x.location),
      startDate: str(x.startDate), endDate: str(x.endDate), current: !!x.current, bullets: arr(x.bullets),
    })),
    education: ensure<ResumeEducation>(s.education).map((x) => ({
      ...x, school: str(x.school), degree: str(x.degree), field: str(x.field),
      startDate: str(x.startDate), endDate: str(x.endDate), notes: str(x.notes),
    })),
    projects: ensure<ResumeProject>(s.projects).map((x) => ({ ...x, name: str(x.name), url: str(x.url), description: str(x.description), tech: arr(x.tech) })),
    skills: ensure<ResumeSkillsGroup>(s.skills).map((x) => ({ ...x, category: str(x.category), items: arr(x.items) })),
    certifications: ensure<ResumeCertification>(s.certifications).map((x) => ({ ...x, name: str(x.name), issuer: str(x.issuer), date: str(x.date), url: str(x.url) })),
    languages: ensure<ResumeLanguage>(s.languages).map((x) => ({ ...x, name: str(x.name), level: str(x.level) })),
  };
}

export const SAMPLE_RESUME: ResumeData = normalizeResume(({
  template: "aurora",
  accent: "#2563eb",
  contact: {
    fullName: "Amina Otieno",
    title: "Senior Product Engineer",
    email: "amina.otieno@mail.com",
    phone: "+254 712 345 678",
    location: "Nairobi, Kenya",
    website: "aminaotieno.dev",
    linkedin: "linkedin.com/in/aminaotieno",
    github: "github.com/aminao",
  },
  summary:
    "Product engineer with 7 years building payments and logistics platforms used by millions across East Africa. Ships end-to-end features, mentors teams, and turns ambiguous problems into measurable outcomes.",
  experience: [
    {
      company: "Safiri Pay", role: "Senior Product Engineer", location: "Nairobi", startDate: "2022-03", endDate: "", current: true,
      bullets: [
        "Led rebuild of merchant checkout, lifting conversion 18% across 40,000 merchants",
        "Architected event-driven settlement service processing $12M daily with 99.98% uptime",
        "Mentored 6 engineers; introduced design reviews that cut production incidents 35%",
      ],
    },
    {
      company: "Tuma Logistics", role: "Software Engineer", location: "Nairobi", startDate: "2019-01", endDate: "2022-02", current: false,
      bullets: [
        "Built real-time rider tracking used by 3,500 couriers and 200 business clients",
        "Reduced route-planning time 42% by shipping a constraint-based dispatch engine",
        "Migrated monolith to TypeScript services, shrinking deploy time from 40 to 8 minutes",
      ],
    },
  ],
  education: [
    { school: "University of Nairobi", degree: "BSc", field: "Computer Science", startDate: "2014-09", endDate: "2018-07", notes: "First Class Honours" },
  ],
  projects: [
    { name: "OpenMpesa SDK", url: "github.com/aminao/openmpesa", description: "Typed SDK for mobile-money APIs with 1.2k GitHub stars and 30 contributors.", tech: ["TypeScript", "Node.js"] },
  ],
  skills: [
    { category: "Languages", items: ["TypeScript", "Go", "Python", "SQL"] },
    { category: "Platforms", items: ["React", "Node.js", "PostgreSQL", "Kafka", "AWS"] },
    { category: "Practices", items: ["System design", "Mentoring", "A/B testing"] },
  ],
  certifications: [{ name: "AWS Solutions Architect – Associate", issuer: "Amazon", date: "2023", url: "" }],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Swahili", level: "Native" },
  ],
}) as never);
