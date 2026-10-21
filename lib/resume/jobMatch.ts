import { KNOWN_TERMS, parseDate, resumeToText } from "./ats";
import { TECH_TERMS, createFactChecker, termKey } from "./importGuard";
import type { ResumeData } from "./types";

export type JobMatchStatus = "empty" | "short" | "ready";
export type TermLevel = "required" | "preferred";
export type TermKind = "skill" | "domain" | "other";
export type CategoryId = "skills" | "experience" | "keywords" | "education" | "workfit";

export interface JobTerm {
  key: string;
  label: string;
  kind: TermKind;
  level: TermLevel;
  /** True when the job description marks it as required (or it sits in a requirements section), not just mentions it. */
  explicit: boolean;
  count: number;
  weight: number;
  /** Supported anywhere in the resume. */
  found: boolean;
  /** Supported by the experience / project text itself, not only by the skills list. */
  demonstrated: boolean;
}
export interface Requirement { label: string; found: boolean; kind: "term" | "degree" | "certification" | "experience" }
export interface AlignmentLine { ok: boolean; text: string }
export interface JobMatchCategory {
  id: CategoryId;
  label: string;
  max: number;
  /** Points earned out of `max`; null when the job description gives nothing to score this category (it is left out). */
  points: number | null;
  detail: string;
}
export interface JobMatchResult {
  status: JobMatchStatus;
  /** 0-100, or null when there is not enough in the job description to score. */
  score: number | null;
  band: string;
  /** Shown when status is not "ready", or when the result is based on little information. */
  message?: string;
  lowConfidence: boolean;
  categories: JobMatchCategory[];
  matched: JobTerm[];
  missing: JobTerm[];
  required: Requirement[];
  preferred: Requirement[];
  experience: AlignmentLine[];
  education: AlignmentLine[];
  strengths: string[];
  gaps: string[];
}

export interface JobMatchOptions {
  /** "Today" for counting the length of a current role. Defaults to the current date. */
  asOf?: Date;
}

export const MIN_JOB_WORDS = 5;
const MAX_JD_CHARS = 20_000;
const MAX_TERMS = 40;
const CATEGORY_META: { id: CategoryId; label: string; max: number }[] = [
  { id: "skills", label: "Skills", max: 35 },
  { id: "experience", label: "Experience", max: 25 },
  { id: "keywords", label: "Keywords", max: 20 },
  { id: "education", label: "Education", max: 10 },
  { id: "workfit", label: "Work fit", max: 10 },
];

export function matchBand(score: number) {
  return score >= 80 ? "Strong match" : score >= 65 ? "Good match" : score >= 50 ? "Partial match" : score >= 35 ? "Weak match" : "Low match";
}

/* ------------------------------------------------------------------------------------------------ */
/* Vocabulary: the shared controlled vocabulary (ats.ts KNOWN_TERMS = importGuard TECH_TERMS + business terms),             */
/* plus a short supplement of common job-posting tools it does not list. Used only to recognise terms in the JD.           */
/* ------------------------------------------------------------------------------------------------ */

const keys = (list: string[]) => list.map(termKey);
const JD_EXTRA = new Set(keys([
  "react native", "spring boot", "ruby on rails", "asp.net", "aws lambda", "azure devops", "visual studio", "sql server", "windows server", "microsoft teams", "google cloud",
  "power automate", "power apps", "oracle", "sharepoint", "intune", "servicenow", "vmware", "hyper-v", "citrix", "sccm", "group policy", "dhcp", "ssl", "okta",
  "splunk", "datadog", "grafana", "prometheus", "sonarqube", "postman", "swagger", "webpack", "vite", "prisma", "drizzle", "mariadb", "sqlite", "dynamodb", "s3", "ec2",
  "airflow", "spark", "etl", "soap", "json", "xml", "oop", "tdd", "saas", "looker", "dbt", "gatsby", "nest.js", "nuxt", "restful api",
]));
const DOMAIN_EXTRA = new Set(keys(["ticketing", "responsive design"]));
const VOCAB = new Set<string>([...KNOWN_TERMS, ...JD_EXTRA, ...DOMAIN_EXTRA]);
/** Words in the shared vocabulary that are too generic to be useful as job keywords, or are ordinary English words. */
const NOISE = new Set(keys(["customer", "client", "stakeholder", "vendor", "supplier", "software", "hardware", "website", "research", "policy", "training", "coaching", "lean", "sage", "tally", "campaign", "inventory",
  // Certification acronyms are handled by the certification checks below, never as keywords (avoids double counting).
  "itil", "pmp", "prince2", "comptia", "cissp", "cism", "cisa", "ceh", "ccna", "ccnp", "acca", "cpa", "cfa", "cima"]));
/** Real words that are also product names: only counted when written like a name (capitalised, not at the start of a sentence). */
const AMBIGUOUS = new Set(keys(["excel", "word", "outlook", "sap", "lan", "wan"]));
/** Practices rather than technologies: counted under "Keywords", not "Skills". */
const DOMAIN_OVERRIDE = new Set(keys(["agile", "scrum", "kanban"]));
const TECH_EXTRA = new Set(keys([
  "react", "next.js", "node.js", "express", "redux", "html5", "css3", "c++", "c#", ".net", "windows", "macos", "power bi", "excel", "microsoft excel", "microsoft office", "microsoft word", "word",
  "powerpoint", "outlook", "google workspace", "google analytics", "active directory", "office 365", "microsoft 365", "linux", "ubuntu", "sap", "erp", "crm", "hubspot", "salesforce", "quickbooks",
  "xero", "zoho", "autocad", "solidworks", "photoshop", "illustrator", "figma", "rest api", "graphql", "ci/cd", "tcp/ip", "vpn", "dns", "firewall", "wifi", "lan", "wan", "router",
  ...JD_EXTRA,
]));
const isSkillKey = (key: string) => !DOMAIN_OVERRIDE.has(key) && (TECH_TERMS.has(key) || TECH_EXTRA.has(key));

const DISPLAY = new Map<string, string>();
for (const name of ["AWS", "SQL", "NoSQL", "HTML", "CSS", "PHP", "API", "GCP", "JWT", "VPN", "DNS", "CRM", "ERP", "SEO", "SAP", "LAN", "WAN", "CI/CD", "TCP/IP", "OAuth", "GraphQL", "MySQL", "PostgreSQL",
  "JavaScript", "TypeScript", "GitHub", "GitLab", "MongoDB", "PowerShell", "DevOps", "Node.js", "Next.js", "React", "Vue.js", "REST API", "Power BI", "Microsoft Office", "Microsoft Excel", "Microsoft Word",
  "Microsoft PowerPoint", "Microsoft Outlook", "Microsoft 365", "Active Directory", "ITIL", "ETL", "JSON", "XML", "SSL", "DHCP", "OOP", "TDD", "SaaS", "S3", "EC2", "SQL Server", "Windows Server", "TensorFlow", "PyTorch",
  "WordPress", "QuickBooks", "HubSpot", "Salesforce", "Kubernetes", "Docker", "ServiceNow", "SharePoint", "VMware", "Jira", "Git", "Linux", "Python", "Java", "Excel"]) DISPLAY.set(termKey(name), name);
const titleCase = (text: string) => text.replace(/\b[a-z]/g, (c) => c.toUpperCase());
function labelFor(key: string, surface: string) {
  const known = DISPLAY.get(key);
  if (known) return known;
  const clean = surface.replace(/\s+/g, " ").trim();
  return /[A-Z]/.test(clean) ? clean : titleCase(clean);
}

/* ------------------------------------------------------------------------------------------------ */
/* Reading the job description                                                                      */
/* ------------------------------------------------------------------------------------------------ */

type Mode = "default" | "required" | "preferred" | "skip";
interface Unit { text: string; level: TermLevel; explicit: boolean }

const exact = (list: string[]) => new RegExp(`^(?:${list.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s-]+")).join("|")})$`, "i");
const HEAD_REQUIRED = exact(["requirements", "requirement", "required", "qualifications", "required qualifications", "minimum qualifications", "minimum requirements", "essential requirements", "essential skills", "required skills", "key requirements", "key skills", "must have", "must haves", "skills", "technical skills", "skills and experience", "skills & experience", "experience and skills", "what you'll need", "what you need", "what you bring", "who you are", "you have", "you will have", "you'll have", "about you", "your profile", "your skills", "education", "education and experience", "candidate profile", "ideal candidate", "essential"]);
const HEAD_PREFERRED = exact(["preferred", "preferred qualifications", "preferred skills", "preferred requirements", "nice to have", "nice to haves", "bonus", "bonus points", "desirable", "desirable skills", "good to have", "a plus", "pluses", "plus", "additional qualifications", "additional skills", "desired skills", "desired qualifications", "extra credit", "advantageous"]);
const HEAD_RESP = exact(["responsibilities", "key responsibilities", "duties", "key duties", "what you'll do", "what you will do", "the role", "role overview", "role description", "job description", "job summary", "overview", "about the role", "about the job", "your role", "day to day", "in this role", "tech stack", "our stack", "technologies"]);
const HEAD_SKIP = exact(["about us", "about the company", "about our company", "who we are", "our mission", "our culture", "our values", "benefits", "perks", "perks & benefits", "perks and benefits", "what we offer", "we offer", "why join us", "why work with us", "compensation", "salary", "equal opportunity", "equal opportunity employer", "how to apply", "application process", "company overview"]);
const ABOUT_COMPANY = /^about\s+(?!you\b|the\s+(?:role|job|position)\b|this\s+(?:role|job|position)\b)\S+(?:\s+\S+){0,2}$/i;

function headingType(label: string): Mode | null {
  const text = label.replace(/[:\-–—\s]+$/, "").replace(/’/g, "'").trim();
  if (!text) return null;
  if (HEAD_SKIP.test(text) || ABOUT_COMPANY.test(text)) return "skip";
  if (HEAD_PREFERRED.test(text)) return "preferred";
  if (HEAD_REQUIRED.test(text)) return "required";
  if (HEAD_RESP.test(text)) return "default";
  return null;
}

const PREFERRED_CUE = /\b(?:preferred|nice[\s-]to[\s-]have|an?\s+plus|plus\s+points?|bonus|desirable|advantageous|an?\s+(?:advantage|asset)|ideally|good\s+to\s+have|beneficial|optional|exposure\s+to|familiarity\s+with)\b/i;
const REQUIRED_CUE = /\b(?:required|requires?|must(?:\s+have)?|essential|mandatory|minimum|at\s+least|proven|proficien(?:t|cy)|strong|solid|extensive|hands[\s-]on|expert(?:ise)?|demonstrated)\b/i;
const HARD_REQUIRED_CUE = /\b(?:required|must(?:\s+have)?|essential|mandatory)\b/i;

function levelOf(sentence: string, mode: Mode): { level: TermLevel; explicit: boolean } {
  if (mode === "preferred") return HARD_REQUIRED_CUE.test(sentence) && !PREFERRED_CUE.test(sentence) ? { level: "required", explicit: true } : { level: "preferred", explicit: false };
  if (PREFERRED_CUE.test(sentence)) return { level: "preferred", explicit: false };
  if (mode === "required" || REQUIRED_CUE.test(sentence)) return { level: "required", explicit: true };
  return { level: "required", explicit: false };
}

/** Splits on sentence ends without regex lookbehind (unsupported in older Safari). */
const sentencesOf = (text: string) => text.replace(/([.!?;])\s+/g, "$1\n").split(/\n+/).map((t) => t.trim()).filter(Boolean);

function readUnits(rawText: string): Unit[] {
  const text = rawText.slice(0, MAX_JD_CHARS).replace(/\r/g, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
  const units: Unit[] = [];
  let mode: Mode = "default";
  for (const raw of text.split("\n")) {
    let line = raw.replace(/^[\s•▪●◦·►✓✔*–—-]+/, "").replace(/\s+/g, " ").trim();
    if (!line) continue;
    let lineMode = mode;
    const colon = line.match(/^([^:]{2,60}?)\s*:\s*(.*)$/);
    const type = colon ? (colon[1].split(/\s+/).length <= 7 ? headingType(colon[1]) : null) : line.length <= 60 && !/[.!?]$/.test(line) ? headingType(line) : null;
    if (type) {
      const rest = colon ? colon[2].trim() : "";
      if (!rest) { mode = type; continue; }
      line = rest; lineMode = type; // "Preferred: Docker, AWS": applies to this line only
    }
    if (lineMode === "skip") continue;
    for (const sentence of sentencesOf(line)) units.push({ text: sentence, ...levelOf(sentence, lineMode) });
  }
  return units;
}

/* Terms ---------------------------------------------------------------------------------------- */

interface Tok { text: string; start: number; end: number }
const TOKEN_RE = /(?:\.(?=[Nn][Ee][Tt]\b))?[A-Za-z0-9][A-Za-z0-9+#.]*/g;
function tokenize(text: string): Tok[] {
  return [...text.matchAll(TOKEN_RE)].map((m) => {
    const raw = m[0];
    const trimmed = raw.replace(/\.+$/, "");
    return { text: trimmed, start: m.index ?? 0, end: (m.index ?? 0) + trimmed.length };
  });
}
/** Adjacent words of one term are separated only by spaces, hyphens, "/" or "&" (so "React, Node" is two terms). */
const joinable = (text: string, a: Tok, b: Tok) => /^[\s\-/&]+$/.test(text.slice(a.end, b.start));

const ACRONYM_STOP = new Set(["EEO", "HR", "PTO", "ASAP", "USA", "UK", "EU", "US", "CEO", "CTO", "CFO", "COO", "VP", "FAQ", "ID", "OK", "AM", "PM", "FT", "PT", "CV", "JD", "TBC", "TBA", "USD", "KES", "KSH", "EUR", "GBP", "NGN", "ZAR", "LLC", "LTD", "INC", "PLC", "MD", "NO", "YES", "OR", "AND", "THE", "FOR", "ALL", "WE", "YOU", "ARE", "IT", "ATS", "AI", "BSC", "MSC", "MBA", "PHD", "BA", "MA", "NGO"]);
const upperRatio = (text: string) => { const letters = text.replace(/[^A-Za-z]/g, ""); return letters.length ? letters.replace(/[^A-Z]/g, "").length / letters.length : 0; };
const isSymbolTech = (t: string) => /^[A-Za-z]{1,12}(?:\+\+|#)$/.test(t) || /^[A-Za-z]{2,}\d+(?:\.\d+)?$/.test(t) || /^[A-Za-z][A-Za-z0-9]*\.js$/i.test(t);

interface Acc { key: string; surface: string; kind: TermKind; level: TermLevel; explicit: boolean; count: number }

function extractTerms(units: Unit[]): JobTerm[] {
  const found = new Map<string, Acc>();
  const add = (key: string, surface: string, kind: TermKind, unit: Unit) => {
    const hit = found.get(key);
    if (!hit) { found.set(key, { key, surface, kind, level: unit.level, explicit: unit.explicit && unit.level === "required", count: 1 }); return; }
    hit.count++;
    if (unit.level === "required") { hit.level = "required"; hit.explicit = hit.explicit || unit.explicit; }
  };
  for (const unitRaw of units) {
    // "AWS certification" is a certification requirement, not a request for AWS skills: blank it out before reading terms.
    const unit = { ...unitRaw, text: unitRaw.text.replace(new RegExp(VENDOR_CERT.source, "gi"), (m) => " ".repeat(m.length)) };
    const tokens = tokenize(unit.text);
    const shouting = upperRatio(unit.text) > 0.6;
    for (let i = 0; i < tokens.length;) {
      let used = 1;
      let matched = false;
      for (let n = Math.min(3, tokens.length - i); n >= 1 && !matched; n--) {
        let ok = true;
        for (let j = i; j < i + n - 1; j++) if (!joinable(unit.text, tokens[j], tokens[j + 1])) { ok = false; break; }
        if (!ok) continue;
        const surface = unit.text.slice(tokens[i].start, tokens[i + n - 1].end);
        const key = termKey(surface.replace(/\//g, " "));
        if (!key || !VOCAB.has(key) || NOISE.has(key)) continue;
        if (AMBIGUOUS.has(key)) {
          const first = tokens[i].text;
          const named = /^[A-Z]/.test(first) && (i > 0 || /^[A-Z]{2,}$/.test(first));
          if (!named || (shouting && !/^[A-Z]{2,}$/.test(first))) continue;
        }
        add(key, surface, isSkillKey(key) ? "skill" : "domain", unit);
        used = n; matched = true;
      }
      if (!matched && !shouting) {
        const word = tokens[i].text;
        if (word.length >= 2 && !NOISE.has(termKey(word)) && ((/^[A-Z]{2,6}$/.test(word) && !ACRONYM_STOP.has(word)) || isSymbolTech(word)) && !VOCAB.has(termKey(word))) add(termKey(word), word, "other", unit);
      }
      i += used;
    }
  }
  const kindWeight = { skill: 1, domain: 0.8, other: 0.6 } as const;
  return [...found.values()].map((a): JobTerm => {
    const levelWeight = a.level === "preferred" ? 0.5 : a.explicit ? 1 : 0.85;
    const frequency = a.count >= 3 ? 1.2 : a.count === 2 ? 1.1 : 1;
    return { key: a.key, label: labelFor(a.key, a.surface), kind: a.kind, level: a.level, explicit: a.explicit, count: a.count, weight: kindWeight[a.kind] * levelWeight * frequency, found: false, demonstrated: false };
  }).sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)).slice(0, MAX_TERMS);
}

/* Role title, years, education, certifications, work mode ---------------------------------------- */

const ROLE_WORDS = /\b(?:engineer|developer|programmer|designer|analyst|manager|accountant|administrator|admin|specialist|consultant|technician|teacher|lecturer|nurse|officer|coordinator|assistant|executive|director|architect|scientist|marketer|writer|editor|auditor|clerk|supervisor|cashier|driver|recruiter|researcher|intern|trainee|support|representative|agent|lead)\b/i;
const TITLE_STOP = new Set(["senior", "junior", "lead", "principal", "staff", "associate", "chief", "head", "sr", "jr", "the", "and", "of", "for", "a", "an", "remote", "hybrid", "contract", "full", "part", "time", "permanent", "temporary", "intern", "internship", "trainee", "graduate", "entry", "level", "new", "open", "role", "position", "job", "vacancy", "hiring", "wanted"]);
const ROLE_CANON: Record<string, string> = { engineer: "developer", programmer: "developer", administrator: "admin", technician: "technician", developers: "developer", engineers: "developer", analysts: "analyst", managers: "manager" };
const titleWords = (title: string) => [...new Set(title.toLowerCase().replace(/[^a-z0-9+#\s/-]/g, " ").split(/[\s/-]+/).filter((w) => w.length >= 2 && !TITLE_STOP.has(w)).map((w) => ROLE_CANON[w] ?? w))];

function jobTitleOf(jd: string): string {
  const labelled = jd.match(/(?:job\s+title|position|vacancy|role\s+title|title)\s*[:\-–]\s*([^\n]{3,80})/i);
  if (labelled) return labelled[1].trim();
  const first = jd.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  if (first && first.length <= 80 && first.split(/\s+/).length <= 9 && !/[.!?]$/.test(first) && ROLE_WORDS.test(first) && !headingType(first)) return first.replace(/\s*[-–|@(].*$/, "").trim() || first;
  const hiring = jd.match(/\b(?:looking\s+for|hiring|seeking|searching\s+for|recruiting)\s+(?:an?\s+|the\s+)?([A-Za-z/& -]{3,60}?)(?=\s+(?:to|who|with|that|for|in|at)\b|[,.;\n])/i);
  return hiring && ROLE_WORDS.test(hiring[1]) ? hiring[1].trim() : "";
}

const NUMBER_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function yearsRequired(units: Unit[]): number | null {
  const num = "(\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)";
  const withExperience = new RegExp(`\\b${num}\\s*(?:\\+|plus)?\\s*(?:(?:-|–|to)\\s*\\d{1,2}\\s*)?(?:\\+\\s*)?(?:years?|yrs?)\\b[^.\\n]{0,40}?\\bexperience`, "i");
  const atLeast = new RegExp(`\\b(?:at\\s+least|minimum(?:\\s+of)?)\\s+${num}\\s*\\+?\\s*(?:years?|yrs?)\\b`, "i");
  for (const unit of units) {
    const m = unit.text.match(withExperience) ?? unit.text.match(atLeast);
    if (!m) continue;
    const n = Number(m[1]) || NUMBER_WORDS[m[1].toLowerCase()] || 0;
    if (n >= 1 && n <= 25) return n;
  }
  return null;
}

interface DegreeNeed { level: number; label: string; field: string[]; level_required: boolean; equivalent: boolean }
const DEGREE_LEVELS: [number, string, RegExp][] = [
  [5, "Doctorate", /\b(?:ph\.?d\.?|doctorate|doctoral)\b/i],
  [4, "Master's degree", /\b(?:master(?:'s|s)?\s+(?:degree|of)|masters?\b(?!\s+(?:data|scrum|class))|m\.?sc\.?|mba|m\.?eng|postgraduate)/i],
  [3, "Bachelor's degree", /\b(?:bachelor(?:'s|s)?|b\.?sc\.?|b\.?eng|b\.?tech|b\.?a\.?\s+(?:in|degree)|undergraduate|university\s+degree|college\s+degree|first\s+degree)\b/i],
  [3, "Degree", /\bdegree\b/i],
  [2, "Associate degree", /\bassociate(?:'s)?\s+degree\b/i],
  [1, "Diploma", /\b(?:diploma|hnd|national\s+diploma|certificate\s+in)\b/i],
];
const FIELD_STOP = new Set(["related", "relevant", "field", "fields", "discipline", "subject", "equivalent", "similar", "area", "areas", "other", "any", "the", "and", "science", "studies"]);
function levelIn(text: string): { level: number; label: string } | null {
  for (const [level, label, re] of DEGREE_LEVELS) if (re.test(text)) return { level, label };
  return null;
}
function degreeNeeds(units: Unit[]): { required: DegreeNeed | null; preferred: DegreeNeed | null } {
  let required: DegreeNeed | null = null;
  let preferred: DegreeNeed | null = null;
  for (const unit of units) {
    const hit = levelIn(unit.text);
    if (!hit) continue;
    // "Bachelor's or Master's": the lower level is the requirement.
    const levels = DEGREE_LEVELS.filter(([, , re]) => re.test(unit.text)).map(([level, label]) => ({ level, label }));
    const lowest = levels.reduce((a, b) => (b.level < a.level ? b : a), levels[0]);
    const equivalent = /\bequivalent|in\s+lieu|or\s+(?:relevant|related|practical|comparable)\s+(?:work\s+)?experience\b/i.test(unit.text);
    const fieldMatch = unit.text.match(/\b(?:degree|diploma|bachelor'?s?|master'?s?|b\.?sc\.?|m\.?sc\.?)[^,;.]{0,12}?\bin\s+([A-Za-z][A-Za-z ,/&-]{2,80})/i);
    const field = fieldMatch ? fieldMatch[1].toLowerCase().split(/[\s,/&-]+/).filter((w) => w.length >= 3 && !FIELD_STOP.has(w)) : [];
    const need: DegreeNeed = { level: lowest.level, label: lowest.label, field, level_required: unit.level === "required" && !equivalent, equivalent };
    if (need.level_required) { if (!required || need.level < required.level) required = need; } else if (!preferred || need.level < preferred.level) preferred = need;
  }
  return { required, preferred };
}

interface CertNeed { label: string; level: TermLevel; vendor?: string; resume: RegExp; anywhere: boolean }
const CERT_PATTERNS: { label: string; jd: RegExp; resume: RegExp; anywhere: boolean }[] = [
  { label: "ITIL", jd: /\bitil\b/i, resume: /\bitil\b/i, anywhere: true },
  { label: "CompTIA", jd: /\bcomptia\b|\b(?:a|network|security)\+\s*(?:certif\w*)?/i, resume: /comptia|\b(?:a|network|security)\+/i, anywhere: true },
  { label: "Cisco (CCNA/CCNP)", jd: /\bcc(?:na|np|ie|nt)\b/i, resume: /\bcc(?:na|np|ie|nt)\b/i, anywhere: true },
  { label: "PMP / PRINCE2", jd: /\b(?:pmp|prince2|capm)\b|project\s+management\s+professional/i, resume: /\b(?:pmp|prince2|capm)\b|project\s+management\s+professional/i, anywhere: true },
  { label: "Scrum certification", jd: /\b(?:csm|psm|pspo)\b|certified\s+scrum|professional\s+scrum|safe\s+agilist/i, resume: /\b(?:csm|psm|pspo)\b|certified\s+scrum|professional\s+scrum|safe\s+agilist/i, anywhere: true },
  { label: "Security certification (CISSP/CISM/CEH)", jd: /\b(?:cissp|cism|cisa|ceh|oscp)\b/i, resume: /\b(?:cissp|cism|cisa|ceh|oscp)\b/i, anywhere: true },
  { label: "Accounting qualification (ACCA/CPA/CFA)", jd: /\b(?:acca|cpa|cfa|cima)\b/i, resume: /\b(?:acca|cpa|cfa|cima)\b/i, anywhere: true },
  { label: "Six Sigma", jd: /\bsix\s+sigma\b/i, resume: /\bsix\s+sigma\b/i, anywhere: true },
];
const VENDOR_CERT = /\b(microsoft|aws|amazon|azure|google|cisco|oracle|salesforce|comptia|red\s+hat|vmware|sap|hubspot|ibm|adobe)\s+(?:certified|certification|certificate)s?\b/i;
const VENDOR_ALIASES: Record<string, string[]> = { aws: ["aws", "amazon"], amazon: ["aws", "amazon"], azure: ["azure", "microsoft"], microsoft: ["microsoft", "azure", "mcsa", "mcse", "mta"], google: ["google", "gcp"] };

function certNeeds(units: Unit[]): CertNeed[] {
  const out = new Map<string, CertNeed>();
  for (const unit of units) {
    // A certification is a hard requirement only when the job description says so explicitly; otherwise it is "preferred" and never penalised.
    const level: TermLevel = unit.level === "required" && HARD_REQUIRED_CUE.test(unit.text) ? "required" : "preferred";
    const put = (label: string, resume: RegExp, anywhere: boolean, vendor?: string) => {
      const prior = out.get(label);
      if (!prior) out.set(label, { label, level, resume, anywhere, vendor });
      else if (level === "required") prior.level = "required";
    };
    for (const p of CERT_PATTERNS) if (p.jd.test(unit.text)) put(p.label, p.resume, p.anywhere);
    const vendor = unit.text.match(VENDOR_CERT);
    if (vendor) {
      const name = vendor[1].toLowerCase().replace(/\s+/g, " ");
      const aliases = VENDOR_ALIASES[name] ?? [name];
      put(`${titleCase(name).replace(/^Aws$/, "AWS").replace(/^Sap$/, "SAP").replace(/^Ibm$/, "IBM")} certification`, new RegExp(`\\b(?:${aliases.map((a) => a.replace(/\s+/g, "\\s+")).join("|")})\\b`, "i"), false, name);
    }
  }
  return [...out.values()];
}

interface WorkSignals { mode: "remote" | "hybrid" | "onsite" | "flexible" | null; places: string[]; place: string }
function workSignals(jd: string): WorkSignals {
  const text = jd.slice(0, MAX_JD_CHARS);
  const notRemote = /\b(?:not|no|non)[\s-]remote\b/i.test(text);
  const remote = !notRemote && /\bremote\b|work\s+from\s+home|\bwfh\b/i.test(text);
  const hybrid = /\bhybrid\b/i.test(text);
  const onsite = notRemote || /\bon[\s-]?site\b|\bin[\s-]office\b|\bin[\s-]person\b|\boffice[\s-]based\b/i.test(text);
  const mode = remote && (hybrid || onsite) ? "flexible" : remote ? "remote" : hybrid ? "hybrid" : onsite ? "onsite" : null;
  const loc = text.match(/(?:[Ww]ork\s+[Ll]ocation|[Jj]ob\s+[Ll]ocation|[Ll]ocation|[Bb]ased\s+in|[Ll]ocated\s+in|[Oo]ffice\s+in)\s*[:\-–]?\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?(?:\s*,\s*[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+)?){0,2})/);
  const place = loc ? loc[1].trim() : "";
  const places = place.toLowerCase().split(/[,\s]+/).filter((w) => w.length >= 3 && !["remote", "hybrid", "onsite", "office"].includes(w));
  return { mode, places, place };
}

/* ------------------------------------------------------------------------------------------------ */
/* Reading the resume                                                                               */
/* ------------------------------------------------------------------------------------------------ */

const stem = (w: string) => (w.length > 5 ? w.replace(/(?:ing|ed|es|s)$/, "") : w);
const stemKeys = (text: string) => {
  const words = (text.toLowerCase().match(/[a-z][a-z0-9+#]*/g) ?? []).map(stem);
  const out = new Set<string>();
  for (let i = 0; i < words.length; i++) for (let n = 1; n <= 3 && i + n <= words.length; n++) out.add(words.slice(i, i + n).join(" "));
  return out;
};
const SHORT_PRODUCTS = new Set(["excel", "word", "powerpoint", "outlook"]);
const EQUIVALENT_GROUPS = [
  ["technical support", "it support", "desktop support", "help desk", "service desk", "end user support"],
  ["customer service", "customer support", "customer care"],
  ["data analysis", "data analytics"],
].map((g) => g.map(termKey));

function supporter(text: string) {
  const checker = createFactChecker(text);
  const stems = stemKeys(text);
  return (term: JobTerm): boolean => {
    const base = term.label;
    const variants = [base];
    // The resume may say "Microsoft Excel" where the job says "Excel" (and the other way round; the checker covers that one).
    if (SHORT_PRODUCTS.has(term.key)) variants.push(`Microsoft ${base}`, `MS ${base}`);
    if (variants.some((v) => checker.skillSupported(v, { expand: true }))) return true;
    // Business terms tolerate inflection ("troubleshooting" / "troubleshoot"); technologies never do.
    if (term.kind !== "domain") return false;
    const stemmed = (text: string) => text.toLowerCase().split(/[\s/-]+/).map(stem).join(" ");
    if (stems.has(stemmed(term.label))) return true;
    const group = EQUIVALENT_GROUPS.find((g) => g.includes(term.key));
    return !!group && group.some((other) => other !== term.key && stems.has(stemmed(other)));
  };
}

function resumeYears(d: ResumeData, asOf: Date): number | null {
  const now = asOf.getFullYear() * 12 + asOf.getMonth();
  const spans: [number, number][] = [];
  for (const x of d.experience ?? []) {
    const a = parseDate(x.startDate);
    if (!a || a.kind === "other") continue;
    const end = x.endDate.trim();
    let hi: number;
    if (x.current && !end) hi = now;
    else if (/^(present|current|now|ongoing|today)$/i.test(end)) hi = now;
    else { const b = parseDate(end); if (!b || b.kind === "other") continue; hi = b.hi; }
    hi = Math.min(hi, now);
    if (hi >= a.lo) spans.push([a.lo, hi]);
  }
  if (!spans.length) return null;
  spans.sort((p, q) => p[0] - q[0]);
  let months = 0;
  let [lo, hi] = spans[0];
  for (const [a, b] of spans.slice(1)) { if (a <= hi + 1) hi = Math.max(hi, b); else { months += hi - lo + 1; lo = a; hi = b; } }
  months += hi - lo + 1;
  return Math.round((months / 12) * 10) / 10;
}

/** Work areas a job description can ask for, and what counts as evidence of them in the resume. */
const AREAS: { label: string; phrase?: string; jd: RegExp; ev: RegExp }[] = [
  { label: "Technical support", jd: /\b(?:technical|it|desktop|end[\s-]user|tier\s*\d)\s+support\b|help[\s-]?desk|service[\s-]?desk|troubleshoot\w*/i, ev: /help[\s-]?desk|service[\s-]?desk|(?:technical|it|desktop|user)\s+support|end[\s-]user|troubleshoot\w*|\btickets?\b|resolv\w+\s+(?:user|access|issue|problem)/i },
  { label: "Windows / Microsoft 365", phrase: "Windows / Microsoft 365", jd: /\bwindows\b|microsoft\s*365|office\s*365|\bm365\b|active\s+directory|\bintune\b|\bentra\b|\bazure\s+ad\b/i, ev: /\bwindows\b|microsoft\s*365|office\s*365|\bms\s+office|microsoft\s+office|active\s+directory|\boutlook\b|\bintune\b|sharepoint/i },
  { label: "Software development", jd: /\b(?:software|web|front[\s-]?end|back[\s-]?end|full[\s-]?stack|application|mobile)\s+(?:developer|development|engineer\w*)|\bprogramming\b|\bcoding\b/i, ev: /\bdevelop(?:ed|ing|er)\b|\bprogramm\w+|\bengineer(?:ed|ing)?\b|\bbuilt\b|\bbuild(?:ing)?\b|\bcoded?\b|\bimplement\w*|\barchitect\w*|\brefactor\w*|\bshipped\b|\bdeploy\w*/i },
  { label: "Cloud", jd: /\b(?:aws|azure|gcp|google\s+cloud|cloud)\b|\bec2\b|\bs3\b/i, ev: /\b(?:aws|azure|gcp|google\s+cloud|cloud)\b|\bec2\b|\bs3\b/i },
  { label: "Networking", jd: /\bnetwork\w*|\brouter|firewall|\bvpn\b|\bdns\b|\bdhcp\b|tcp\/ip|\blan\b|\bwan\b|wi-?fi/i, ev: /\bnetwork\w*|\brouter|firewall|\bvpn\b|\bdns\b|\bdhcp\b|tcp\/ip|\blan\b|\bwan\b|wi-?fi|\bswitch(?:es)?\b/i },
  { label: "Data & reporting", jd: /data\s+analy\w+|analytics|\bsql\b|power\s*bi|tableau|dashboards?|reporting|\bexcel\b/i, ev: /data\s+analy\w+|analytics|\bsql\b|power\s*bi|tableau|dashboards?|reports?\b|reporting|\bexcel\b|spreadsheet/i },
  { label: "Project management", jd: /project\s+manage\w*|\bscrum\b|\bagile\b|\bkanban\b|product\s+manage\w*/i, ev: /\bprojects?\b|\bsprints?\b|\bscrum\b|\bagile\b|\bkanban\b|coordinat\w+|\broadmap\b|\bdelivered\b/i },
  { label: "Customer service", jd: /customer\s+(?:service|support|success|care)|client[\s-]facing|account\s+management/i, ev: /\bcustomers?\b|\bclients?\b|\bguests?\b|customer\s+(?:service|support)|\bcomplaints?\b/i },
  { label: "Sales", jd: /\bsales\b|business\s+development|lead\s+generation|account\s+executive/i, ev: /\bsales\b|\brevenue\b|\bquota\b|\bleads?\b|\bpipeline\b|business\s+development|\bupsell\w*/i },
  { label: "Finance & accounting", jd: /\baccounting\b|bookkeeping|payroll|financial\s+(?:reporting|statements?)|reconciliation|\baudit\w*|\btax\b|invoic\w+|budget\w*/i, ev: /\baccounting\b|bookkeeping|payroll|financial|reconcil\w+|\baudit\w*|\btax\b|invoic\w+|budget\w*|ledger/i },
  { label: "Security", jd: /cyber\s?security|information\s+security|\binfosec\b|penetration|\bsiem\b|security\s+operations/i, ev: /security|vulnerab\w+|penetration|firewall|encrypt\w+|\bsiem\b|access\s+control/i },
  { label: "DevOps / CI-CD", phrase: "DevOps / CI-CD", jd: /\bdevops\b|ci\/cd|\bkubernetes\b|\bdocker\b|\bterraform\b|\bjenkins\b|deployment\s+pipeline/i, ev: /\bdevops\b|ci\/cd|\bkubernetes\b|\bdocker\b|\bterraform\b|\bjenkins\b|\bpipelines?\b|\bdeploy\w*/i },
  { label: "Testing / QA", jd: /\bqa\b|quality\s+assurance|test\s+automation|\bselenium\b|\bcypress\b|\bunit\s+test\w*|\btesting\b/i, ev: /\btest(?:s|ed|ing)?\b|\bqa\b|quality\s+assurance|\bselenium\b|\bcypress\b|\bjest\b/i },
  { label: "Marketing", jd: /marketing|\bseo\b|social\s+media|copywriting|content\s+(?:creation|marketing)/i, ev: /marketing|\bseo\b|social\s+media|copywrit\w+|\bcontent\b|\bcampaigns?\b/i },
];

/* ------------------------------------------------------------------------------------------------ */
/* Analysis                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
const round1 = (n: number) => Math.round(n * 10) / 10;

function emptyResult(status: JobMatchStatus, message?: string): JobMatchResult {
  return { status, score: null, band: "", message, lowConfidence: false, categories: [], matched: [], missing: [], required: [], preferred: [], experience: [], education: [], strengths: [], gaps: [] };
}

export function analyzeJobMatch(resume: ResumeData, jobDescription: string, options: JobMatchOptions = {}): JobMatchResult {
  const jd = (jobDescription ?? "").slice(0, MAX_JD_CHARS).replace(/\r/g, "").trim();
  if (!jd) return emptyResult("empty");
  const plainWords = wordCount(jd.replace(/<[^>]+>/g, " "));
  if (plainWords < MIN_JOB_WORDS) return emptyResult("short", "That is very short. Paste the full job description (responsibilities and requirements) for a meaningful match.");

  const asOf = options.asOf ?? new Date();
  const units = readUnits(jd);
  const terms = extractTerms(units);
  const degree = degreeNeeds(units);
  const certs = certNeeds(units);
  const years = yearsRequired(units);
  const title = jobTitleOf(jd);
  const work = workSignals(jd);

  /* Resume evidence ------------------------------------------------------------------------- */
  const experience = resume.experience ?? [];
  const projects = resume.projects ?? [];
  const contextText = [
    ...experience.flatMap((x) => [x.role, x.company, ...x.bullets]),
    ...projects.flatMap((p) => [p.name, p.description, ...p.tech]),
  ].filter(Boolean).join("\n");
  const skillsText = (resume.skills ?? []).flatMap((g) => g.items).join("\n");
  const allText = resumeToText(resume);
  const supportsAll = supporter(allText);
  const supportsContext = supporter(contextText);
  for (const t of terms) { t.found = supportsAll(t); t.demonstrated = t.found && supportsContext(t); }
  const resumeWords = wordCount(allText);
  const resumeThin = resumeWords < 25;

  const ratioOf = (list: JobTerm[], credit: (t: JobTerm) => number) => {
    const max = list.reduce((n, t) => n + t.weight, 0);
    return max ? list.reduce((n, t) => n + t.weight * credit(t), 0) / max : null;
  };
  const skillTerms = terms.filter((t) => t.kind === "skill");
  const keywordTerms = terms.filter((t) => t.kind !== "skill");
  const foundCount = (list: JobTerm[]) => list.filter((t) => t.found).length;

  /* Skills / Technologies ------------------------------------------------------------------- */
  const skillsRatio = ratioOf(skillTerms, (t) => (t.found ? 1 : 0));
  const keywordsRatio = ratioOf(keywordTerms, (t) => (t.found ? 1 : 0));

  /* Experience / Role relevance ------------------------------------------------------------- */
  const ownTitles = [resume.contact?.title ?? "", ...experience.map((x) => x.role)].filter((t) => t.trim());
  const jdTitleWords = titleWords(title);
  let titleRatio: number | null = null;
  let titleMatch = "";
  if (jdTitleWords.length && ownTitles.length) {
    for (const own of ownTitles) {
      const words = new Set(titleWords(own));
      const r = jdTitleWords.filter((w) => words.has(w)).length / jdTitleWords.length;
      if (titleRatio === null || r > titleRatio) { titleRatio = r; titleMatch = own.trim(); }
    }
  }
  // Skills backed by real work/project text count fully; skills only listed in a skills section count a little.
  const evidenceRatio = terms.length ? ratioOf(terms, (t) => (t.demonstrated ? 1 : t.found ? 0.3 : 0)) : null;
  const ownYears = resumeYears(resume, asOf);
  const yearsRatio = years !== null && ownYears !== null ? Math.min(1, ownYears / years) : null;
  const parts = [{ w: 0.35, r: titleRatio }, { w: 0.45, r: evidenceRatio }, { w: 0.2, r: yearsRatio }].filter((p): p is { w: number; r: number } => p.r !== null);
  const experienceRatio = parts.length ? parts.reduce((n, p) => n + p.w * p.r, 0) / parts.reduce((n, p) => n + p.w, 0) : null;

  const contextLower = contextText.toLowerCase();
  const listedLower = `${skillsText}\n${resume.summary ?? ""}`.toLowerCase();
  const requiredJd = units.filter((u) => u.level === "required").map((u) => u.text).join("\n");
  const areas = AREAS.map((a) => ({ a, mentions: (jd.match(new RegExp(a.jd.source, "gi")) ?? []).length, asked: new RegExp(a.jd.source, "i").test(requiredJd) })).filter((x) => x.mentions > 0)
    .sort((p, q) => q.mentions - p.mentions || p.a.label.localeCompare(q.a.label)).slice(0, 5)
    .map(({ a, asked }) => ({ label: a.label, phrase: a.phrase ?? a.label.toLowerCase(), asked, state: a.ev.test(contextLower) ? "shown" as const : a.ev.test(listedLower) ? "listed" as const : "none" as const }))
    .filter((a) => a.asked || a.state === "shown");

  /* Education / Certifications -------------------------------------------------------------- */
  const education: AlignmentLine[] = [];
  const eduItems: { w: number; credit: number }[] = [];
  const ownDegrees = (resume.education ?? []).map((e) => ({ hit: levelIn(`${e.degree} ${e.field} ${e.notes}`), text: `${e.degree} ${e.field} ${e.notes}`.toLowerCase() }));
  const bestDegree = ownDegrees.reduce<{ level: number; text: string } | null>((best, d) => (d.hit && (!best || d.hit.level > best.level) ? { level: d.hit.level, text: d.text } : best), null);
  const degreeLine = (need: DegreeNeed, requiredFlag: boolean) => {
    const meets = bestDegree !== null && bestDegree.level >= need.level;
    const fieldOk = !need.field.length || (bestDegree !== null && need.field.some((w) => ownDegrees.some((d) => d.text.includes(w))));
    const noun = need.label === "Degree" ? "Degree" : need.label;
    if (meets && fieldOk) education.push({ ok: true, text: `${noun} ${requiredFlag ? "requirement" : "(preferred)"} supported` });
    else if (meets) education.push({ ok: false, text: `${noun} found, but not clearly in the requested field (${need.field.join(", ")})` });
    else education.push({ ok: false, text: `${noun} ${requiredFlag ? "requested" : "preferred"}; not found on the resume${need.equivalent ? " (equivalent experience may be accepted)" : ""}` });
    return meets ? (fieldOk ? 1 : 0.5) : 0;
  };
  if (degree.required) eduItems.push({ w: 3, credit: degreeLine(degree.required, true) });
  else if (degree.preferred) { const c = degreeLine(degree.preferred, false); if (c > 0) eduItems.push({ w: 1, credit: c }); }
  const certText = (resume.certifications ?? []).map((c) => `${c.name} ${c.issuer}`).join("\n");
  const certRows = certs.map((c) => {
    const have = c.resume.test(certText) || (c.anywhere && c.resume.test(allText));
    return { c, have };
  });
  for (const { c, have } of certRows) {
    education.push({ ok: have, text: have ? `${c.label} supported` : `${c.label} not found${c.level === "preferred" ? " (preferred)" : ""}` });
    if (c.level === "required") eduItems.push({ w: 2, credit: have ? 1 : 0 });
    else if (have) eduItems.push({ w: 1, credit: 1 });
  }
  const eduMax = eduItems.reduce((n, i) => n + i.w, 0);
  const educationRatio = eduMax ? eduItems.reduce((n, i) => n + i.w * i.credit, 0) / eduMax : null;

  /* Job-type / work-mode fit ---------------------------------------------------------------- */
  const ownPlace = (resume.contact?.location ?? "").toLowerCase();
  let workRatio: number | null = null;
  let workDetail = "Work mode and location are not specified";
  const placeLabel = work.place || "the stated location";
  // A remote role says nothing about this resume, so it is left out of the score rather than handing everyone free points.
  if (work.mode === "remote" || work.mode === "flexible") workDetail = work.mode === "remote" ? "Remote role: location is not a barrier (not scored)" : "Remote option available (not scored)";
  else if (work.places.length && ownPlace) {
    const same = work.places.some((p) => ownPlace.includes(p));
    workRatio = same ? 1 : work.mode ? 0 : 0.3;
    workDetail = same ? `Location matches (${work.place})` : `Role is based in ${placeLabel}; your resume lists ${resume.contact.location.trim()}`;
  } else if (work.places.length) workDetail = `Role is based in ${placeLabel}; add your location to compare`;
  else if (work.mode) workDetail = `${titleCase(work.mode === "onsite" ? "on-site" : work.mode)} role; no location stated`;

  /* Score ------------------------------------------------------------------------------------ */
  const ratios: Record<CategoryId, number | null> = { skills: skillsRatio, experience: experienceRatio, keywords: keywordsRatio, education: educationRatio, workfit: workRatio };
  const detail: Record<CategoryId, string> = {
    skills: skillTerms.length ? `${foundCount(skillTerms)} of ${skillTerms.length} requested technologies found` : "No specific technologies in the job description",
    experience: experienceRatio === null ? "Not enough role details to compare" : [
      titleRatio !== null ? (titleRatio >= 0.5 ? "Job title aligns" : "Job title differs") : "",
      evidenceRatio !== null ? `${terms.filter((t) => t.demonstrated).length} of ${terms.length} terms shown in your experience` : "",
      yearsRatio !== null ? `${round1(ownYears ?? 0)} of ${years}+ years` : "",
    ].filter(Boolean).join(" · "),
    keywords: keywordTerms.length ? `${foundCount(keywordTerms)} of ${keywordTerms.length} requested terms found` : "No other keywords in the job description",
    education: educationRatio === null ? "No education or certification requirement stated" : `${eduItems.filter((i) => i.credit > 0).length} of ${eduItems.length} requirements supported`,
    workfit: workDetail,
  };
  const categories: JobMatchCategory[] = CATEGORY_META.map((m) => ({ ...m, points: ratios[m.id] === null ? null : Math.round(m.max * (ratios[m.id] as number)), detail: detail[m.id] }));
  const scored = categories.filter((c) => c.points !== null);
  const score = scored.length ? Math.round((100 * scored.reduce((n, c) => n + (c.points as number), 0)) / scored.reduce((n, c) => n + c.max, 0)) : null;

  /* Requirements breakdown ------------------------------------------------------------------ */
  const required: Requirement[] = terms.filter((t) => t.level === "required").map((t) => ({ label: t.label, found: t.found, kind: "term" as const }));
  const preferred: Requirement[] = terms.filter((t) => t.level === "preferred").map((t) => ({ label: t.label, found: t.found, kind: "term" as const }));
  if (years !== null) required.push({ label: `${years}+ years of experience`, found: ownYears !== null && ownYears >= years, kind: "experience" });
  if (degree.required) required.push({ label: degree.required.label, found: (bestDegree?.level ?? 0) >= degree.required.level, kind: "degree" });
  else if (degree.preferred) preferred.push({ label: degree.preferred.label, found: (bestDegree?.level ?? 0) >= degree.preferred.level, kind: "degree" });
  for (const { c, have } of certRows) (c.level === "required" ? required : preferred).push({ label: c.label, found: have, kind: "certification" });

  /* Experience alignment (only what the resume actually shows) ------------------------------ */
  const experienceLines: AlignmentLine[] = [];
  const hasExperience = experience.some((x) => x.role.trim() || x.company.trim() || x.bullets.length);
  const demonstratedShare = terms.length ? terms.filter((t) => t.demonstrated).length / terms.length : 0;
  const anyShown = areas.some((a) => a.state === "shown");
  const comparable = terms.length > 0 || areas.length > 0 || titleRatio !== null || years !== null;
  if (!comparable) { /* nothing in the job description to compare against */ }
  else if (!hasExperience && !projects.some((p) => p.description.trim())) experienceLines.push({ ok: false, text: "No work experience on the resume to compare" });
  else if ((titleRatio ?? 0) >= 0.5 || anyShown || demonstratedShare >= 0.25) experienceLines.push({ ok: true, text: hasExperience ? "Relevant experience detected" : "Relevant project work detected (no work experience listed)" });
  else experienceLines.push({ ok: false, text: "Limited evidence of directly relevant experience" });
  if (title && titleRatio !== null) experienceLines.push(titleRatio >= 0.5 ? { ok: true, text: `Job title aligns with "${titleMatch}"` } : { ok: false, text: `Job title "${title}" differs from your listed roles` });
  for (const a of areas) {
    if (a.state === "shown") experienceLines.push({ ok: true, text: `${a.label} experience` });
    else if (a.state === "listed") experienceLines.push({ ok: false, text: `${a.label}: mentioned in your skills or summary, but not shown in your experience` });
    else experienceLines.push({ ok: false, text: `Limited evidence of ${a.phrase} experience` });
  }
  if (years !== null) {
    if (ownYears === null) experienceLines.push({ ok: false, text: `${years}+ years requested; your dates do not clearly establish this` });
    else if (ownYears >= years) experienceLines.push({ ok: true, text: `${years}+ years requested; your resume shows about ${round1(ownYears)}` });
    else experienceLines.push({ ok: false, text: `${years}+ years requested; your resume shows about ${round1(ownYears)}` });
  }

  /* Strengths and gaps ---------------------------------------------------------------------- */
  const matched = terms.filter((t) => t.found);
  const missing = terms.filter((t) => !t.found);
  const strengths: string[] = [];
  const topSkills = matched.filter((t) => t.kind === "skill").slice(0, 3).map((t) => t.label);
  if (topSkills.length >= 2) strengths.push(`${skillsRatio !== null && skillsRatio >= 0.75 ? "Strong" : "Good"} match on ${list(topSkills)}`);
  else if (topSkills.length === 1) strengths.push(`${topSkills[0]} is supported by your resume`);
  const topDomain = matched.filter((t) => t.kind !== "skill").slice(0, 3).map((t) => t.label);
  if (topDomain.length) strengths.push(`Relevant terms covered: ${list(topDomain)}`);
  for (const a of areas.filter((x) => x.state === "shown").slice(0, 2)) strengths.push(`Relevant ${a.phrase} experience`);
  if (titleRatio !== null && titleRatio >= 0.5) strengths.push(`Job title aligns with your experience as ${titleMatch}`);
  if (years !== null && ownYears !== null && ownYears >= years) strengths.push(`Experience length fits (about ${round1(ownYears)} years vs ${years}+ requested)`);
  const matchedSkills = matched.filter((t) => t.kind === "skill");
  if (matchedSkills.length >= 3 && matchedSkills.filter((t) => t.demonstrated).length / matchedSkills.length >= 0.6) strengths.push("Your key skills are backed by examples in your experience");
  if (degree.required && (bestDegree?.level ?? 0) >= degree.required.level) strengths.push("Education requirement is supported");
  for (const { c, have } of certRows) if (have) strengths.push(`${c.label} is supported`);

  const gaps: string[] = [];
  if (resumeThin) gaps.push("Your resume has very little content to compare. Add your experience and skills first.");
  const missingRequired = missing.filter((t) => t.level === "required");
  for (const t of missingRequired.slice(0, 3)) gaps.push(`${t.label} is requested but not found in the resume.`);
  if (missingRequired.length > 3) gaps.push(`${missingRequired.length - 3} more requested ${plural(missingRequired.length - 3, "keyword is", "keywords are")} not found in the resume: ${missingRequired.slice(3, 8).map((t) => t.label).join(", ")}${missingRequired.length > 8 ? "…" : ""}.`);
  if (years !== null && (ownYears === null || ownYears < years)) gaps.push(ownYears === null ? `The job asks for ${years}+ years of experience; the resume does not clearly establish this.` : `The job asks for ${years}+ years of experience; the resume shows about ${round1(ownYears)}.`);
  if (degree.required && (bestDegree?.level ?? 0) < degree.required.level) gaps.push(`${degree.required.label} is requested; not found on the resume.`);
  for (const { c, have } of certRows) if (c.level === "required" && !have) gaps.push(`${c.label} is required; not found on the resume.`);
  if (workRatio === 0) gaps.push(workDetail + ".");
  const missingPreferred = missing.filter((t) => t.level === "preferred");
  if (missingPreferred.length) gaps.push(`Preferred but not found in the resume: ${missingPreferred.slice(0, 5).map((t) => t.label).join(", ")}${missingPreferred.length > 5 ? "…" : ""}.`);
  const limitedAreas = areas.filter((a) => a.state === "none").slice(0, 1);
  for (const a of limitedAreas) gaps.push(`Limited evidence of ${a.phrase} experience in the resume.`);

  const lowConfidence = terms.length < 3 || plainWords < 40;
  const result: JobMatchResult = {
    status: "ready", score, band: score === null ? "" : matchBand(score), lowConfidence, categories,
    matched, missing, required, preferred, experience: experienceLines.slice(0, 7), education,
    strengths: strengths.slice(0, 5), gaps: gaps.slice(0, 7),
  };
  if (score === null) result.message = "No specific skills, tools or requirements were found in this text. Paste the full responsibilities and requirements for a match.";
  else if (lowConfidence) result.message = "Not much detail was found in this description, so treat the match as a rough guide.";
  return result;
}
