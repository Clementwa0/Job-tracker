import type {
  ResumeCertification, ResumeContact, ResumeEducation, ResumeExperience,
  ResumeLanguage, ResumeProject, ResumeSkillsGroup,
} from "./types";

type WithoutId<T> = Omit<T, "id">;

/** Resume content returned by the import API. Same shape as ResumeData minus ids/template, normalised later by normalizeResume(). */
export interface ImportedResume {
  contact: ResumeContact;
  summary: string;
  experience: WithoutId<ResumeExperience>[];
  education: WithoutId<ResumeEducation>[];
  projects: WithoutId<ResumeProject>[];
  skills: WithoutId<ResumeSkillsGroup>[];
  certifications: WithoutId<ResumeCertification>[];
  languages: WithoutId<ResumeLanguage>[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const asText = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 5_000) : "");
const asList = (value: unknown) => (Array.isArray(value) ? value.slice(0, 50) : []);
const asStrings = (value: unknown, limit: number) =>
  asList(value).filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, limit);

/** Validates the shape of the Groq response and trims it to the Resume Builder schema. */
export function sanitizeImportedResume(parsed: Record<string, unknown>): ImportedResume {
  const contact = isRecord(parsed.contact) ? parsed.contact : {};
  return {
    contact: {
      fullName: asText(contact.fullName), title: asText(contact.title), email: asText(contact.email),
      phone: asText(contact.phone), location: asText(contact.location), website: asText(contact.website),
      linkedin: asText(contact.linkedin), github: asText(contact.github),
    },
    summary: asText(parsed.summary),
    experience: asList(parsed.experience).filter(isRecord).map((entry) => {
      const current = entry.current === true;
      return {
        company: asText(entry.company), role: asText(entry.role), location: asText(entry.location),
        startDate: asText(entry.startDate), endDate: current ? "" : asText(entry.endDate), current,
        bullets: asStrings(entry.bullets, 30),
      };
    }).filter((entry) => entry.company || entry.role || entry.bullets.length),
    education: asList(parsed.education).filter(isRecord).map((entry) => ({
      school: asText(entry.school), degree: asText(entry.degree), field: asText(entry.field),
      startDate: asText(entry.startDate), endDate: asText(entry.endDate), notes: asText(entry.notes),
    })).filter((entry) => entry.school || entry.degree || entry.field),
    projects: asList(parsed.projects).filter(isRecord).map((entry) => ({
      name: asText(entry.name), url: asText(entry.url), description: asText(entry.description), tech: asStrings(entry.tech, 30),
    })).filter((entry) => entry.name || entry.description),
    skills: asList(parsed.skills).filter(isRecord).map((entry) => ({
      category: asText(entry.category), items: asStrings(entry.items, 50),
    })).filter((entry) => entry.items.length),
    certifications: asList(parsed.certifications).filter(isRecord).map((entry) => ({
      name: asText(entry.name), issuer: asText(entry.issuer), date: asText(entry.date), url: asText(entry.url),
    })).filter((entry) => entry.name),
    languages: asList(parsed.languages).filter(isRecord).map((entry) => ({ name: asText(entry.name), level: asText(entry.level) })).filter((entry) => entry.name),
  };
}

const NAME_STOP_WORDS = new Set(["the", "and", "of", "for", "ltd", "limited", "inc", "llc", "co", "company", "university", "college", "school", "institute"]);
const tokenize = (text: string) => text.toLowerCase().match(/[a-z0-9][a-z0-9+#.]*/g)?.map((token) => token.replace(/\.+$/, "")) ?? [];
const numbersIn = (text: string) => text.replace(/(\d),(?=\d{3}\b)/g, "$1").match(/\d+(?:\.\d+)?/g) ?? [];

/* -------------------------------------------------------------------------------------------------
 * Exact / alias-aware term matching. This is the ONE place that decides whether a skill, technology,
 * keyword or other named term is "supported" by a resume. Two terms are the same only when their
 * normalised forms are equal or they sit in the same explicit alias group below. There is no partial
 * token overlap: "React" is not "React Native", "Java" is not "JavaScript", "AWS" is not "AWS Lambda".
 * ---------------------------------------------------------------------------------------------- */

/** Explicit, safe aliases: each group is one thing written several ways. Add a group only when the terms are truly interchangeable. */
const ALIAS_GROUPS: string[][] = [
  ["JavaScript", "JS"], ["TypeScript", "TS"],
  ["MS Office", "Microsoft Office", "Office 365", "Microsoft 365"],
  ["MS Word", "Microsoft Word"], ["MS Excel", "Microsoft Excel"],
  ["MS PowerPoint", "Microsoft PowerPoint"], ["MS Outlook", "Microsoft Outlook"],
  ["Node", "Node.js", "NodeJS"], ["React", "React.js", "ReactJS"], ["Vue", "Vue.js", "VueJS"],
  ["Next.js", "NextJS"], ["Express", "Express.js", "ExpressJS"],
  ["PostgreSQL", "Postgres"], ["MongoDB", "Mongo"], ["Kubernetes", "K8s"],
  ["Amazon Web Services", "AWS"], ["Google Cloud Platform", "GCP"],
  ["Machine Learning", "ML"], ["Artificial Intelligence", "AI"],
  ["CI/CD", "CICD"], ["REST API", "RESTful API"], [".NET", "dotnet"],
  ["Bachelor of Science", "BSc", "B.Sc"], ["Master of Science", "MSc", "M.Sc"],
  ["Master of Business Administration", "MBA"], ["Doctor of Philosophy", "PhD"],
];

/** One-way expansions (only where a caller opts in with `expand`): the full product name is implied by the short one already present. */
const EXPANSION_GROUPS: [string, string][] = [
  ["Microsoft Excel", "Excel"], ["Microsoft Word", "Word"], ["Microsoft PowerPoint", "PowerPoint"], ["Microsoft Outlook", "Outlook"],
];

const foldPlural = (word: string) => (word.length > 3 && word.endsWith("s") && !/(ss|us|as)$/.test(word) ? word.slice(0, -1) : word);

/** Lower-case, punctuation-insensitive, plural-insensitive form: "Node.js" -> "node js", "CI/CD" -> "ci cd", "REST APIs" -> "rest api". */
function baseKey(value: string): string {
  return value.toLowerCase()
    .replace(/^\.net\b/, "dotnet")
    .replace(/\.js\b/g, " js")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#.\s]+/g, " ")
    .split(/\s+/).map((word) => word.replace(/^\.+|\.+$/g, "")).filter(Boolean)
    .map(foldPlural).join(" ");
}

const ALIAS_OF = new Map<string, string>();
for (const group of ALIAS_GROUPS) {
  const keys = group.map(baseKey);
  for (const key of keys) ALIAS_OF.set(key, keys[0]);
}
/** Canonical key of a term: equal keys mean "exactly the same term or a defined alias". */
export const termKey = (value: string) => { const key = baseKey(value); return ALIAS_OF.get(key) ?? key; };
/** True when two skills/terms are the same after normalisation or are explicitly defined aliases. */
export const sameSkill = (a: string, b: string) => { const key = termKey(a); return key !== "" && key === termKey(b); };

const EXPANDS_FROM = new Map<string, string[]>();
for (const [full, short] of EXPANSION_GROUPS) EXPANDS_FROM.set(termKey(full), [termKey(short)]);

interface Tok { text: string; adj: boolean; start: number; end: number }
const WORD_RE = /(?:\.(?=[Nn][Ee][Tt]\b))?[A-Za-z0-9][A-Za-z0-9+#.]*/g;
const MAX_WINDOW = 4;
const LIST_STOP = new Set(["and", "or", "with", "using", "in", "for", "the", "a", "an", "to", "on", "at", "by", "is", "was", "were", "are", "from", "via", "into", "across", "as"]);
const capOrTech = (word: string) => /^[A-Z0-9.]/.test(word) || /[+#]/.test(word);

/** Words of a text; `adj` marks a word joined to the next by plain spaces or a hyphen (so "React Native" is one run, "React, Node" is not). */
function toks(segment: string): Tok[] {
  const matches = [...segment.matchAll(WORD_RE)];
  return matches.map((match, i) => {
    const raw = match[0];
    const start = match.index ?? 0;
    const next = matches[i + 1];
    const gap = next ? segment.slice(start + raw.length, next.index ?? 0) : "";
    return { text: raw.replace(/\.+$/, ""), adj: Boolean(next) && !raw.endsWith(".") && /^(?:[ \t]+|-)$/.test(gap), start, end: start + raw.length };
  });
}

/**
 * Index of every 1-4 word term in a text.
 * `mentioned`: the term occurs somewhere (also inside a longer term). `standalone`: the term occurs on its own, i.e. it is not just the
 * start of a longer capitalised/technical term (so "React" in "React Native" is mentioned but not standalone) - this is what supports a skill.
 */
function buildTermIndex(text: string) {
  const mentioned = new Set<string>();
  const standalone = new Set<string>();
  // A whole line is also one term, so an original skill item such as "Microsoft Office (Word, Excel)" always supports itself.
  for (const line of text.split("\n")) {
    const key = line.trim().length <= 100 ? termKey(line) : "";
    if (key) { mentioned.add(key); standalone.add(key); }
  }
  for (const segment of text.split(/[\n,;|•·()[\]]+/)) {
    const tokens = toks(segment);
    if (!tokens.length) continue;
    // Short stop-word-free segments are skill-list items ("react native", "Cloud computing"): only the whole item counts.
    const listLike = tokens.length <= 4 && !tokens.some((token) => LIST_STOP.has(token.text.toLowerCase()));
    let from = 0;
    for (let n = 0; n < tokens.length; n++) {
      if (tokens[n].adj && n < tokens.length - 1) continue;
      const run = tokens.slice(from, n + 1);
      from = n + 1;
      for (let i = 0; i < run.length; i++) {
        for (let j = i; j < Math.min(run.length, i + MAX_WINDOW); j++) {
          const key = termKey(run.slice(i, j + 1).map((token) => token.text).join(" "));
          if (!key) continue;
          mentioned.add(key);
          const extended = j < run.length - 1 && capOrTech(run[j + 1].text);
          if (listLike ? i === 0 && j === run.length - 1 : !extended) standalone.add(key);
        }
      }
    }
  }
  return { mentioned, standalone };
}

/** Plain technology names that must be traceable to the source even when written in lower case or at the start of a sentence. */
export const TECH_TERMS = new Set([
  "python", "java", "javascript", "typescript", "golang", "rust", "kotlin", "ruby", "php", "scala", "perl", "matlab", "sql", "nosql", "html", "css", "sass", "bash", "powershell",
  "angular", "vue", "svelte", "django", "flask", "fastapi", "spring", "laravel", "node", "jquery", "bootstrap", "tailwind", "dotnet",
  "docker", "kubernetes", "terraform", "ansible", "jenkins", "git", "github", "gitlab", "bitbucket", "jira", "confluence", "figma", "photoshop", "illustrator", "excel", "powerpoint", "tableau", "powerbi", "salesforce", "sap", "quickbooks", "linux", "unix",
  "aws", "azure", "gcp", "heroku", "postgres", "mysql", "mongodb", "redis", "kafka", "rabbitmq", "hadoop", "snowflake", "bigquery", "elasticsearch", "firebase", "supabase", "graphql", "grpc",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit", "selenium", "cypress", "jest", "junit", "pytest", "agile", "scrum", "kanban", "devops", "oauth", "jwt", "nginx", "apache", "android", "flutter", "wordpress", "shopify", "magento", "hubspot", "zendesk", "trello", "asana", "stripe", "paypal",
].map(termKey));
const GENERIC_TERMS = new Set(["ats", "cv", "it"]);

/** Seniority / scope words. Using one that the original never used would inflate the candidate's experience. */
const CLAIM_FAMILIES: [string, RegExp][] = [
  ["leadership", /\b(lead|leads|led|leading|leader|leadership)\b/i],
  ["supervision", /\b(supervis\w*|oversaw|oversee\w*|oversight)\b/i],
  ["mentoring", /\b(mentor\w*|coach\w*)\b/i],
  ["architecture/pioneering", /\b(architect\w*|spearhead\w*|pioneer\w*)\b/i],
  ["seniority/ownership", /\b(senior|principal|chief|head of|director|founder|founded|co-?founded)\b/i],
];
const SPELLED_QUANTITIES = /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundreds?|thousands?|millions?|billions?|dozens?|doubled|tripled|quadrupled|halved)\b/gi;

const FIGURE_RE = /([$£€])?\s?(\d+(?:\.\d+)?)(\s?(?:%|percent\b))?/gi;
const figuresIn = (text: string) =>
  [...text.replace(/(\d),(?=\d{3}\b)/g, "$1").matchAll(FIGURE_RE)].map((m) => ({ shown: m[0].trim(), value: m[2], currency: Boolean(m[1]), percent: Boolean(m[3]) }));

export interface TermOptions {
  /** Also accept a full product name implied by the short one already present ("Excel" -> "Microsoft Excel"). */
  expand?: boolean;
}

/** Checks text produced by the AI against the original content it was given. */
export function createFactChecker(sourceText: string) {
  const sourceLower = sourceText.toLowerCase();
  const sourceTokens = new Set(tokenize(sourceText));
  const sourceNumbers = new Set(numbersIn(sourceText));
  const sourceFigures = figuresIn(sourceText);
  const sourceSpelled = new Set((sourceText.match(SPELLED_QUANTITIES) ?? []).map((word) => word.toLowerCase()));
  const sourceClaims = new Set(CLAIM_FAMILIES.filter(([, pattern]) => pattern.test(sourceText)).map(([name]) => name));
  const { mentioned, standalone } = buildTermIndex(sourceText);

  const known = (key: string, expand?: boolean) =>
    mentioned.has(key) || (expand === true && (EXPANDS_FROM.get(key) ?? []).some((short) => mentioned.has(short)));
  const standsAlone = (key: string, expand?: boolean) =>
    standalone.has(key) || (expand === true && (EXPANDS_FROM.get(key) ?? []).some((short) => standalone.has(short)));

  function supportedSkill(value: string, options?: TermOptions) {
    // "Microsoft Office / Microsoft 365" is two terms; every part must be supported.
    const parts = value.split(/\s+\/\s+/).map((part) => part.trim()).filter(Boolean);
    return parts.length > 0 && parts.every((part) => { const key = termKey(part); return key !== "" && standsAlone(key, options?.expand); });
  }

  return {
    sourceText,
    /** True when a name (employer, role, school, certification) can be traced to the source. */
    nameSupported(value: string) {
      if (!value || sourceLower.includes(value.toLowerCase())) return true;
      const tokens = tokenize(value).filter((token) => !NAME_STOP_WORDS.has(token));
      return tokens.length === 0 || tokens.some((token) => sourceTokens.has(token));
    },
    /** Exact (normalised) or explicit-alias match against the source. No partial token overlap: "React" is not "React Native". */
    skillSupported: supportedSkill,
    /** Same strict rule, used to classify job-description keywords as matched (supported) or missing. */
    phraseSupported: (value: string) => supportedSkill(value),
    /** True when a single word/token (or one of its defined aliases) appears anywhere in the source. */
    hasToken: (token: string) => sourceTokens.has(token.toLowerCase()) || mentioned.has(termKey(token)),
    /**
     * Numbers/percentages in `text` that never appear in the source. `strict` (AI rewriting) also requires "%"/currency to match
     * and rejects spelled-out quantities such as "five" or "doubled" that the source never uses.
     */
    unsupportedNumbers(text: string, strict = false) {
      if (!strict) return numbersIn(text).filter((n) => !sourceNumbers.has(n));
      // Digits inside a supported alias such as "Microsoft 365" (source: "MS Office") are part of a name, not a figure.
      let cleaned = text;
      const tokens = toks(text);
      for (let i = 0; i < tokens.length; i++) {
        for (let len = 2; len <= 3 && i + len <= tokens.length; len++) {
          const window = tokens.slice(i, i + len);
          if (!window.slice(0, -1).every((token) => token.adj) || !window.some((token) => /\d/.test(token.text))) continue;
          if (known(termKey(window.map((token) => token.text).join(" ")))) {
            cleaned = cleaned.slice(0, window[0].start) + " ".repeat(window[len - 1].end - window[0].start) + cleaned.slice(window[len - 1].end);
          }
        }
      }
      const bad = figuresIn(cleaned)
        .filter((f) => !sourceFigures.some((s) => s.value === f.value && (!f.percent || s.percent) && (!f.currency || s.currency)))
        .map((f) => f.shown);
      const spelled = (cleaned.match(SPELLED_QUANTITIES) ?? []).map((word) => word.toLowerCase()).filter((word) => !sourceSpelled.has(word));
      return [...new Set([...bad, ...spelled])];
    },
    /**
     * Named terms in free text that the source never mentions: proper nouns (employers, places, certifications, tools, months),
     * acronyms, technical tokens and well-known technologies. Plain rewording is not flagged.
     */
    unsupportedTerms(text: string, options?: TermOptions) {
      const out: string[] = [];
      for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
        const tokens = toks(sentence);
        // The first word is capitalised because it starts the sentence. In a normal sentence a leading title-case run is also
        // just wording ("Software Developer with..."); a sentence that is capitalised throughout ("First Class Honours") is not.
        let lead = 0;
        while (lead < tokens.length && /^[A-Z]/.test(tokens[lead].text)) lead++;
        if (!tokens.some((token) => /^[a-z]/.test(token.text))) lead = Math.min(lead, 1);
        for (let i = 0; i < tokens.length;) {
          let span = 1;
          for (let len = Math.min(MAX_WINDOW, tokens.length - i); len >= 2; len--) {
            const window = tokens.slice(i, i + len);
            if (window.slice(0, -1).every((token) => token.adj) && known(termKey(window.map((token) => token.text).join(" ")), options?.expand)) { span = len; break; }
          }
          if (span === 1) {
            const word = tokens[i].text;
            const key = termKey(word);
            const explained = known(key, options?.expand) || sourceTokens.has(word.toLowerCase());
            const factual = word.length >= 2 && !GENERIC_TERMS.has(word.toLowerCase()) && (
              /[+#]/.test(word) || (/\d/.test(word) && /[A-Za-z]/.test(word)) || /^[A-Z][A-Z0-9]+$/.test(word) || TECH_TERMS.has(key) || (i >= lead && /^[A-Z]/.test(word))
            );
            if (!explained && factual) out.push(word);
          }
          i += span;
        }
      }
      return [...new Set(out)];
    },
    /** Seniority/scope claims ("led", "supervised", "mentored", "senior"...) that the source never makes. */
    unsupportedClaims: (text: string) => CLAIM_FAMILIES.filter(([name, pattern]) => pattern.test(text) && !sourceClaims.has(name)).map(([name]) => name),
  };
}

export interface GuardResult {
  resume: ImportedResume;
  /** Everything unsupported that was found; used as retry feedback. */
  problems: string[];
  /** True when core facts (employer, job title, school, certification) are not traceable to the CV. */
  fatal: boolean;
}

/**
 * Programmatic no-fabrication check against the original CV text.
 * - Core identities (employer, role, school, certification) must be traceable to the CV, otherwise `fatal`.
 * - Unsupported metrics, skills and dates are removed from the returned resume and reported in `problems`.
 */
export function guardAgainstFabrication(resume: ImportedResume, sourceText: string): GuardResult {
  const { nameSupported, skillSupported, unsupportedNumbers } = createFactChecker(sourceText);
  const problems: string[] = [];
  let fatal = false;

  const checkDate = (value: string, label: string) => {
    const year = value.match(/^\d{4}/)?.[0];
    if (year && !sourceText.includes(year)) {
      problems.push(`${label}: date "${value}" is not in the CV`);
      return "";
    }
    return value;
  };
  const checkText = (text: string, label: string) => {
    const bad = unsupportedNumbers(text);
    if (bad.length) problems.push(`${label}: contains figures not in the CV (${bad.join(", ")})`);
    return bad.length === 0;
  };
  const checkName = (value: string, label: string) => {
    if (nameSupported(value)) return;
    fatal = true;
    problems.push(`${label} "${value}" does not appear in the CV`);
  };

  const experience = resume.experience.map((entry) => {
    checkName(entry.company, "Employer");
    checkName(entry.role, "Job title");
    const bullets = entry.bullets.filter((bullet) => checkText(bullet, `Bullet "${bullet.slice(0, 60)}"`));
    if (entry.bullets.length > 0 && bullets.length === 0) fatal = true;
    return {
      ...entry, bullets,
      startDate: checkDate(entry.startDate, `${entry.company} start date`),
      endDate: checkDate(entry.endDate, `${entry.company} end date`),
    };
  });

  const education = resume.education.map((entry) => {
    checkName(entry.school, "Institution");
    return {
      ...entry,
      startDate: checkDate(entry.startDate, `${entry.school} start date`),
      endDate: checkDate(entry.endDate, `${entry.school} end date`),
    };
  });

  const certifications = resume.certifications.map((entry) => {
    checkName(entry.name, "Certification");
    return { ...entry, date: entry.date && /^\d{4}/.test(entry.date) ? checkDate(entry.date, `${entry.name} date`) : entry.date };
  });

  const projects = resume.projects.map((entry) => ({
    ...entry,
    description: checkText(entry.description, `Project "${entry.name}" description`) ? entry.description : "",
    tech: entry.tech.filter((item) => {
      const ok = skillSupported(item);
      if (!ok) problems.push(`Technology "${item}" is not in the CV`);
      return ok;
    }),
  }));

  const seen = new Set<string>();
  const skills = resume.skills.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      if (skillSupported(item)) return true;
      problems.push(`Skill "${item}" is not in the CV`);
      return false;
    }),
  })).filter((group) => group.items.length);

  const summary = checkText(resume.summary, "Summary") ? resume.summary : "";

  return { resume: { ...resume, summary, experience, education, certifications, projects, skills }, problems, fatal };
}

/** A resume with no usable content would be a broken import. */
export function hasUsableContent(resume: ImportedResume): boolean {
  return Boolean(
    resume.contact.fullName || resume.experience.length || resume.education.length || resume.skills.length || resume.projects.length,
  );
}
