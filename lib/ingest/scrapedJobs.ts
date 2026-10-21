/**
 * Maps a record from the JobTrail scraper API (GET /api/v1/jobs) onto the
 * shape of a `job_postings` row.
 *
 * Pure functions only (no DB, no network) so the mapping can be tested on its
 * own. The scraper API has returned two shapes so far, and both are accepted:
 *
 *   v1 (flat):   application_email, application_url, deadline, salary_min,
 *                description_sections / description_text, categories ...
 *   v2 (nested): application{...}, compensation{...}, experience{...},
 *                classification{...}, description{summary, responsibilities,
 *                requirements, skills, ...}, metadata{...}
 *
 * `normalizeRecord` flattens either into one shape before mapping. Every field
 * is treated as optional because other sources will be messier.
 */
import type {
  EXPERIENCE_LEVELS,
  JOB_CATEGORIES,
} from "@/lib/jobPostings/options";
import type { DescriptionSection } from "@/types/jobPosting";

/* ------------------------------------------------------------------ */
/* Scraper API types (only the fields we read)                         */
/* ------------------------------------------------------------------ */

export interface ScrapedBlock {
  type?: string;
  text?: string;
  ordered?: boolean;
  items?: unknown[];
}

export interface ScrapedJob {
  id: number;
  title?: string | null;
  title_clean?: string | null;
  slug?: string | null;
  company?: string | null;
  location?: string | null;
  job_type?: string | null;
  work_mode?: string | null;
  experience_min_years?: number | null;
  experience_level?: string | null;
  category?: string | null;
  categories?: string[] | null;
  salary_min?: string | number | null;
  salary_max?: string | number | null;
  salary_currency?: string | null;
  /** Canonical API: structured description object, including `sections`. */
  description?: unknown;
  qualifications?: unknown;
  description_html?: string | null;
  description_text?: string | null;
  description_sections?: Array<{
    heading?: string | null;
    blocks?: ScrapedBlock[] | null;
  }> | null;
  application_email?: string | null;
  application_url?: string | null;
  application_destination_url?: string | null;
  application_instructions?: string | null;
  status?: string | null;
  published_at?: string | null;
  deadline?: string | null;
  source?: {
    key?: string | null;
    name?: string | null;
    url?: string | null;
  } | null;
}

/** The v2 `description` object, reduced to what we use. */
interface DescriptionGroups {
  summary: string | null;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  benefits: string[];
  additional: string[];
}

/** A scraper record after v1/v2 differences have been flattened away. */
export interface FlatJob extends ScrapedJob {
  groups: DescriptionGroups | null;
  skills: string[];
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

type Category = (typeof JOB_CATEGORIES)[number];
type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export interface MappedPosting {
  sourceKey: string;
  sourceName: string | null;
  sourceJobId: string;
  sourceUrl: string | null;

  title: string;
  slug: string;
  companyName: string;
  category: Category;
  description: string;
  descriptionSections: DescriptionSection[] | null;
  responsibilities: string;
  requirements: string;
  educationLevel: string;
  certifications: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  tags: string[];
  jobType: "full-time" | "part-time" | "contract" | "internship";
  /** "" = not stated. */
  workMode: "onsite" | "remote" | "hybrid" | "";
  experienceLevel: ExperienceLevel | "";

  applyMethodType: "external_link" | "email";
  applyMethodValue: string;
  applyEmailSubject: string;
  applyViaAggregator: boolean;
  applicationInstructions: string;

  publishedAt: Date | null;
  applicationDeadline: Date | null;
  /** True when the scraper reports the listing as no longer active. */
  inactive: boolean;
}

export type MapResult =
  | { ok: true; posting: MappedPosting }
  | { ok: false; reason: "no_apply_path" | "missing_identity" | "expired" };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const KNOWN_AGGREGATORS = [
  "myjobmag",
  "brightermonday",
  "fuzu",
  "jobwebkenya",
  "careerpointkenya",
];
const STOP_WORDS = new Set(["and", "of", "the", "for", "in", "to", "at", "a"]);
const REF_PATTERN = /^ref(?:erence)?\.?\s*no\.?\s*[:.]?\s*(.+)$/i;
const BULLET_PATTERN = /^\s*(?:[-•*–]\s+|\d{1,2}[.)]\s+)/;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.replace(/\s+/g, " ").trim();
  return t || null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeUrl(value: unknown): URL | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "company"
  );
}

/** Deterministic company slug so repeat runs find the same company row. */
export function importedCompanySlug(name: string): string {
  return `src-${slugify(name)}`.slice(0, 80);
}

/* ------------------------------------------------------------------ */
/* v1 / v2 normalisation                                               */
/* ------------------------------------------------------------------ */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const obj = (v: unknown): Obj => (isObj(v) ? v : {});

function strings(v: unknown): string[] {
  return Array.isArray(v)
    ? v.map(text).filter((t): t is string => !!t)
    : [];
}

function rawString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Accepts a v1 (flat) or v2 (nested) record and returns one flat shape. */
export function normalizeRecord(raw: unknown): FlatJob {
  const r = obj(raw);
  const app = obj(r.application);
  const comp = obj(r.compensation);
  const exp = obj(r.experience);
  const cls = obj(r.classification);
  const desc = isObj(r.description) ? r.description : null;

  const categories = dedupe([
    ...strings(r.categories),
    ...strings([cls.primary_category]),
    ...strings(cls.secondary_categories),
    ...strings(cls.source_categories),
  ]);

  return {
    ...(r as unknown as ScrapedJob),
    category: text(r.category) ?? text(cls.primary_category),
    categories,
    salary_min: (r.salary_min ?? comp.min_amount ?? comp.min ?? comp.minimum ?? null) as string | number | null,
    salary_max: (r.salary_max ?? comp.max_amount ?? comp.max ?? comp.maximum ?? null) as string | number | null,
    salary_currency: text(r.salary_currency) ?? text(comp.currency),
    experience_min_years:
      toNumber(r.experience_min_years) ?? toNumber(exp.min_years) ??
      toNumber(exp.minimum_years) ?? toNumber(exp.years_required),
    experience_level: text(r.experience_level) ?? text(exp.level) ?? text(exp.seniority),
    application_email: text(r.application_email) ?? text(app.email) ??
      ((text(app.method) ?? text(app.type)) === "email" ? text(app.value) : null),
    application_url: rawString(
      r.application_url,
      app.url,
      app.apply_url,
      (text(app.method) ?? text(app.type)) !== "email" ? app.value : null,
    ),
    application_destination_url: rawString(
      r.application_destination_url,
      app.destination_url,
      app.employer_url,
    ),
    application_instructions: rawString(
      r.application_instructions,
      app.instructions,
    ),
    deadline: rawString(r.deadline, app.deadline),
    groups: desc
      ? {
          summary: text(desc.summary),
          responsibilities: dedupe(strings(desc.responsibilities)),
          requirements: dedupe(strings(desc.requirements)),
          preferred: dedupe(strings(desc.preferred_qualifications)),
          benefits: dedupe(strings(desc.benefits)),
          additional: strings(desc.additional_information),
        }
      : null,
    skills: desc ? strings(desc.skills) : [],
  };
}

/* ------------------------------------------------------------------ */
/* Description                                                         */
/* ------------------------------------------------------------------ */

function cleanHeading(value: unknown): string | null {
  return text(value)?.replace(/[\s:\-–]+$/, "").trim() || null;
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&#39;|&apos;/gi, "'");
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<li\b[^>]*>/gi, "\n- ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|ul|ol|h[1-6])>/gi, "\n\n")
      .replace(/<[^>]*>/g, " "),
  );
}

/** Rebuilds headings, paragraphs and lists from plain text. */
function parseText(input: string): DescriptionSection[] {
  const lines = input
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim());
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { heading: null, paragraphs: [], lists: [] };
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (list && list.items.length) current.lists.push(list);
    list = null;
  };
  const flushSection = () => {
    flushList();
    if (current.heading || current.paragraphs.length || current.lists.length) {
      sections.push(current);
    }
  };

  lines.forEach((line, i) => {
    if (!line) {
      flushList();
      return;
    }
    const bullet = line.match(BULLET_PATTERN);
    if (bullet) {
      if (!list) list = { ordered: /^\s*\d/.test(bullet[0]), items: [] };
      list.items.push(line.slice(bullet[0].length).trim());
      return;
    }
    flushList();

    const prevBlank = i === 0 || !lines[i - 1];
    const next = lines[i + 1];
    const looksLikeHeading =
      prevBlank &&
      !!next &&
      ((line.length <= 70 && !/[.;,?]$/.test(line)) ||
        (line.length <= 100 && /:-?$/.test(line)));

    if (looksLikeHeading) {
      flushSection();
      current = { heading: line, paragraphs: [], lists: [] };
      return;
    }
    current.paragraphs.push(line);
  });

  flushSection();
  return sections;
}

function sectionsFromStructured(job: ScrapedJob): DescriptionSection[] {
  // Canonical v16 API shape: description.sections[].{heading, paragraphs, lists}.
  // Prefer this ordered representation over flattened/grouped description fields
  // so the frontend retains the source's original section order and hierarchy.
  const description = obj(job.description);
  const canonical = description.sections;
  if (Array.isArray(canonical)) {
    const out: DescriptionSection[] = [];
    for (const rawSection of canonical) {
      if (!isObj(rawSection)) continue;
      const paragraphs = strings(rawSection.paragraphs);
      const lists: DescriptionSection["lists"] = [];
      if (Array.isArray(rawSection.lists)) {
        for (const rawList of rawSection.lists) {
          if (!isObj(rawList)) continue;
          const items = dedupe(strings(rawList.items));
          if (items.length) {
            lists.push({ ordered: rawList.ordered === true, items });
          }
        }
      }
      const heading = cleanHeading(rawSection.heading);
      if (heading || paragraphs.length || lists.length) {
        out.push({ heading, paragraphs, lists });
      }
    }
    if (out.length) return out;
  }

  // Backward compatibility for earlier scraper responses that used
  // description_sections[].blocks[].
  const raw = job.description_sections;
  if (!Array.isArray(raw)) return [];
  const out: DescriptionSection[] = [];

  for (const section of raw) {
    if (!section || typeof section !== "object") continue;
    const paragraphs: string[] = [];
    const lists: DescriptionSection["lists"] = [];

    for (const block of Array.isArray(section.blocks) ? section.blocks : []) {
      if (!block || typeof block !== "object") continue;
      if (block.type === "list" && Array.isArray(block.items)) {
        const items = dedupe(
          block.items.map(text).filter((t): t is string => !!t),
        );
        if (items.length) lists.push({ ordered: block.ordered === true, items });
      } else {
        const t = text(block.text);
        if (t) paragraphs.push(t);
      }
    }
    out.push({ heading: cleanHeading(section.heading), paragraphs, lists });
  }
  return out;
}

/**
 * Pulls "Ref. No." lines out, drops headings without content (unless they
 * introduce another headed section, e.g. "Person Specification"), and turns
 * over-long headings into paragraphs.
 */
function tidySections(input: DescriptionSection[]): {
  sections: DescriptionSection[];
  reference: string | null;
} {
  let reference: string | null = null;
  const cleaned: DescriptionSection[] = [];

  for (const s of input) {
    let heading = s.heading;
    const paragraphs: string[] = [];

    if (heading) {
      const m = heading.match(REF_PATTERN);
      if (m) {
        reference ??= m[1].trim();
        heading = null;
      }
    }
    for (const p of s.paragraphs) {
      const m = p.match(REF_PATTERN);
      if (m) reference ??= m[1].trim();
      else paragraphs.push(p);
    }
    if (heading && heading.length > 100) {
      paragraphs.unshift(heading);
      heading = null;
    }
    cleaned.push({ heading, paragraphs, lists: s.lists });
  }

  const sections = cleaned.filter((s, i) => {
    if (s.paragraphs.length > 0 || s.lists.length > 0) return true;
    return !!s.heading && !!cleaned[i + 1]?.heading;
  });
  return { sections, reference };
}

/**
 * v2 descriptions arrive pre-grouped. "additional_information" often holds the
 * role overview itself, so without a summary it becomes the intro; with a
 * summary it stays at the end under its own heading.
 */
function sectionsFromGroups(g: DescriptionGroups): DescriptionSection[] {
  const out: DescriptionSection[] = [];
  const list = (heading: string, items: string[]) => {
    if (items.length) {
      out.push({ heading, paragraphs: [], lists: [{ ordered: false, items }] });
    }
  };

  if (g.summary) {
    out.push({ heading: null, paragraphs: [g.summary], lists: [] });
  } else if (g.additional.length) {
    out.push({ heading: null, paragraphs: g.additional, lists: [] });
  }
  list("Responsibilities", g.responsibilities);
  list("Requirements", g.requirements);
  list("Preferred qualifications", g.preferred);
  list("Benefits", g.benefits);
  if (g.summary && g.additional.length) {
    out.push({
      heading: "Additional information",
      paragraphs: g.additional,
      lists: [],
    });
  }
  return out;
}

function buildDescription(job: FlatJob): {
  sections: DescriptionSection[];
  plain: string;
} {
  // Explicit source sections are authoritative: they preserve the original
  // heading/paragraph/list order better than the normalized grouped fields.
  let { sections, reference } = tidySections(sectionsFromStructured(job));
  let hasContent = sections.some((s) => s.paragraphs.length || s.lists.length);
  if (hasContent) {
    if (reference && sections.length) {
      sections = [
        { heading: null, paragraphs: [`Reference number: ${reference}`], lists: [] },
        ...sections,
      ];
    }
    return { sections, plain: sectionsToPlainText(sections) };
  }

  if (job.groups) {
    const grouped = sectionsFromGroups(job.groups);
    if (grouped.length) {
      return { sections: grouped, plain: sectionsToPlainText(grouped) };
    }
  }

  if (!hasContent) {
    const source = text(job.description_text)
      ? (job.description_text as string)
      : job.description_html
        ? htmlToText(job.description_html)
        : "";
    if (source) {
      const tidy = tidySections(parseText(source));
      sections = tidy.sections;
      reference ??= tidy.reference;
      hasContent = sections.some((s) => s.paragraphs.length || s.lists.length);
    }
  }

  if (!hasContent) sections = [];

  // Keep the employer's reference number: some employers reject applications
  // that don't quote it.
  if (reference && sections.length) {
    sections = [
      { heading: null, paragraphs: [`Reference number: ${reference}`], lists: [] },
      ...sections,
    ];
  }

  return { sections, plain: sectionsToPlainText(sections) };
}

export function sectionsToPlainText(sections: DescriptionSection[]): string {
  const blocks: string[] = [];
  for (const s of sections) {
    const lines: string[] = [];
    if (s.heading) lines.push(s.heading);
    lines.push(...s.paragraphs);
    for (const l of s.lists) {
      lines.push(l.items.map((item) => `- ${item}`).join("\n"));
    }
    if (lines.length) blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Field mappings                                                      */
/* ------------------------------------------------------------------ */

const CATEGORY_RULES: Array<[RegExp, Category]> = [
  [/cyber|infosec|information security/, "Cybersecurity"],
  [/data|analytics|statistic/, "Data & Analytics"],
  [/network/, "Networking"],
  [/telecom/, "ICT/Telecommunications"],
  [/software|developer|programming|web dev/, "Software Development"],
  [/\bict\b|computer|information tech|\bit\b|tech support/, "IT & Support"],
  [/finance|account|audit|banking|insurance/, "Finance & Accounting"],
  [/human resource|\bhr\b|recruit/, "Human Resources"],
  [/legal|law|compliance/, "Legal"],
  [/hospitality|hotel|tourism|catering|restaurant|travel/, "Hospitality & Tourism"],
  [/health|medic|nurs|clinical|hospital/, "Healthcare & Medical"],
  [/pharma/, "Pharmaceutical"],
  [/educat|teach|training|lectur|academic/, "Education"],
  [/construct|building|architect|quantity survey/, "Construction"],
  [/manufactur|production|factory/, "Manufacturing"],
  [/procure|purchasing|tender/, "Procurement"],
  [/logistic|supply chain|transport|warehouse|shipping/, "Logistics & Supply Chain"],
  [/agri|farm|veterin/, "Agriculture"],
  [/marketing|brand|advertis/, "Marketing"],
  [/media|editorial|journalis|content|communication|public relations/, "Media & Communications"],
  [/sales|business development/, "Sales"],
  [/customer (service|care|support)|call cent/, "Customer Support"],
  [/design|creative|graphic|ux\b/, "Design"],
  [/product manage/, "Product"],
  [/research|monitoring|evaluation/, "Research"],
  [/engineer|technical|technician|mechanic|electric|aviation|aerospace/, "Engineering"],
  [/admin|operations|secretar|office|management|manager/, "Operations"],
];

/** The board filters categories by exact match, so map into JOB_CATEGORIES. */
export function mapCategory(job: ScrapedJob): Category {
  const labels = [...(job.categories ?? []), job.category ?? ""]
    .map((c) => c.toLowerCase())
    .filter((c) => c && !/intern/.test(c));

  for (const label of labels) {
    for (const [pattern, category] of CATEGORY_RULES) {
      if (pattern.test(label)) {
        // ICT is broad; let the title pick a more specific bucket first.
        if (category === "IT & Support") return refineIct(job) ?? category;
        return category;
      }
    }
  }
  return "Other";
}

function refineIct(job: ScrapedJob): Category | null {
  const title = (job.title_clean ?? job.title ?? "").toLowerCase();
  for (const [pattern, category] of CATEGORY_RULES.slice(0, 5)) {
    if (pattern.test(title)) return category;
  }
  return null;
}

export function mapJobType(job: ScrapedJob): MappedPosting["jobType"] {
  const raw = (job.job_type ?? "").toLowerCase().replace(/[\s_]+/g, "-");
  const isInternship =
    /intern|attach?ment|trainee/.test(raw) ||
    (job.categories ?? []).some((c) => /intern/i.test(c)) ||
    /\bintern(ship)?\b/i.test(job.title_clean ?? job.title ?? "");

  if (isInternship) return "internship";
  if (raw === "part-time" || raw === "parttime") return "part-time";
  if (/contract|temporary|casual|consult|freelance|fixed-term/.test(raw)) {
    return "contract";
  }
  return "full-time";
}

export function mapWorkMode(job: ScrapedJob): MappedPosting["workMode"] {
  const raw = (job.work_mode ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (raw === "onsite" || raw === "inoffice") return "onsite";
  if (raw === "remote" || raw === "wfh") return "remote";
  if (raw === "hybrid") return "hybrid";
  return "";
}

export function mapExperienceLevel(job: ScrapedJob): ExperienceLevel | "" {
  const explicit = (job.experience_level ?? "").toLowerCase();
  if (/executive|c-suite|c suite/.test(explicit)) return "Executive";
  if (/lead|principal/.test(explicit)) return "Lead / Principal";
  if (/senior/.test(explicit)) return "Senior";
  if (/mid|intermediate/.test(explicit)) return "Mid-level";
  if (/entry|junior|graduate|intern/.test(explicit)) return "Entry-level";

  const title = (job.title_clean ?? job.title ?? "").toLowerCase();
  if (/\b(chief|director|head of|ceo|cfo|cto)\b/.test(title)) return "Executive";

  const years = toNumber(job.experience_min_years);
  if (years === null) {
    return mapJobType(job) === "internship" ? "Entry-level" : "";
  }
  if (years <= 1) return "Entry-level";
  if (years <= 4) return "Mid-level";
  if (years <= 9) return "Senior";
  return "Lead / Principal";
}

/* ------------------------------------------------------------------ */
/* Applying                                                            */
/* ------------------------------------------------------------------ */

function isAggregatorHost(url: URL, job: ScrapedJob): boolean {
  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const sourceUrl = safeUrl(job.source?.url);
  if (sourceUrl) {
    const src = sourceUrl.hostname.replace(/^www\./i, "").toLowerCase();
    if (host === src || host.endsWith(`.${src}`)) return true;
  }
  const key = job.source?.key?.toLowerCase();
  if (key && host.includes(key)) return true;
  return KNOWN_AGGREGATORS.some((a) => host.includes(a));
}

function extractEmail(job: ScrapedJob): string | null {
  const direct = text(job.application_email);
  if (direct && new RegExp(`^${EMAIL_PATTERN.source}$`, "i").test(direct)) {
    return direct;
  }
  const found = (job.application_instructions ?? "").match(EMAIL_PATTERN);
  return found?.[0] ?? null;
}

export function extractSubject(
  instructions: string | null | undefined,
  title: string,
): string {
  const t = instructions ?? "";
  const named = t.match(
    /with\s+((?:(?!\bwith\b).){2,80}?)\s+(?:on|in|as)\s+(?:the\s+)?subject/i,
  );
  if (named) return named[1].trim();
  if (/using\s+the\s+position\s+as\s+(?:the\s+)?subject/i.test(t)) return title;
  return "";
}

/* ------------------------------------------------------------------ */
/* Source link                                                         */
/* ------------------------------------------------------------------ */

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * The scraper has attached another listing's URL to some records (ids 728 and
 * 729 in the sample). Keep the link only if its path contains the first three
 * significant words of this job's title.
 */
function trustedSourceUrl(job: ScrapedJob, title: string): string | null {
  const url = safeUrl(job.source?.url);
  if (!url) return null;
  const path = url.pathname.toLowerCase();
  return tokens(title)
    .slice(0, 3)
    .every((t) => path.includes(t))
    ? url.href
    : null;
}

function textFromSection(section: DescriptionSection): string {
  return [
    ...section.paragraphs,
    ...section.lists.flatMap((list) => list.items.map((item) => `- ${item}`)),
  ].join("\n").trim();
}

function sectionField(
  sections: DescriptionSection[],
  headingPattern: RegExp,
): string {
  return sections
    .filter((section) => section.heading && headingPattern.test(section.heading))
    .map(textFromSection)
    .filter(Boolean)
    .join("\n\n");
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value)) {
      const joined = strings(value).join("\n");
      if (joined) return joined;
    }
  }
  return "";
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function mapScrapedJob(raw: unknown, now = new Date()): MapResult {
  const job = normalizeRecord(raw);
  const slug = text(job.slug);
  const title = text(job.title_clean) ?? text(job.title);
  if (!slug || !title) return { ok: false, reason: "missing_identity" };

  const deadline = toDate(job.deadline);
  const normalizedStatus = text(job.status)?.toLowerCase();
  const inactive = !!normalizedStatus &&
    /^(inactive|closed|expired|removed|archived|deleted|withdrawn|cancelled|canceled)$/.test(normalizedStatus);
  if (deadline && deadline.getTime() < now.getTime()) {
    return { ok: false, reason: "expired" };
  }

  // Apply path: destination URL, then application URL, then email.
  const instructions = job.application_instructions?.trim() || "";
  const destination = safeUrl(job.application_destination_url);
  const link = safeUrl(job.application_url);
  const email = extractEmail(job);

  let applyMethodType: MappedPosting["applyMethodType"];
  let applyMethodValue: string;
  let applyViaAggregator = false;

  if (destination) {
    applyMethodType = "external_link";
    applyMethodValue = destination.href;
  } else if (link) {
    applyMethodType = "external_link";
    applyMethodValue = link.href;
    applyViaAggregator = isAggregatorHost(link, job);
  } else if (email) {
    applyMethodType = "email";
    applyMethodValue = email;
  } else {
    return { ok: false, reason: "no_apply_path" };
  }

  const description = buildDescription(job);
  const qualification = obj(job.qualifications);
  const responsibilities = firstText(
    sectionField(description.sections, /responsibilit|duties|what you.?ll do|key tasks/i),
    job.groups?.responsibilities,
  );
  const requirements = firstText(
    sectionField(description.sections, /requirements?|qualifications?|person specification|what you.?ll need|skills and experience/i),
    job.groups?.requirements,
  );
  const educationLevel = firstText(
    qualification.education_level,
    qualification.minimum_education,
    qualification.education,
  );
  const certifications = firstText(
    qualification.certifications,
    qualification.certification,
  );

  return {
    ok: true,
    posting: {
      sourceKey: text(job.source?.key) ?? "unknown",
      sourceName: text(job.source?.name),
      sourceJobId: slug,
      sourceUrl: trustedSourceUrl(job, title),

      title,
      slug,
      companyName: text(job.company) ?? "Unlisted employer",
      category: mapCategory(job),
      description: description.plain,
      descriptionSections: description.sections.length
        ? description.sections
        : null,
      responsibilities,
      requirements,
      educationLevel,
      certifications,
      location: text(job.location) ?? "",
      salaryMin: roundOrNull(toNumber(job.salary_min)),
      salaryMax: roundOrNull(toNumber(job.salary_max)),
      salaryCurrency: text(job.salary_currency) ?? "KES",
      tags: dedupe(job.skills)
        .map((t) => t.slice(0, 40))
        .slice(0, 15),
      jobType: mapJobType(job),
      workMode: mapWorkMode(job),
      experienceLevel: mapExperienceLevel(job),

      applyMethodType,
      applyMethodValue,
      applyEmailSubject:
        applyMethodType === "email" ? extractSubject(instructions, title) : "",
      applyViaAggregator,
      applicationInstructions: instructions,

      publishedAt: toDate(job.published_at),
      applicationDeadline: deadline,
      inactive,
    },
  };
}

function roundOrNull(n: number | null): number | null {
  return n === null ? null : Math.round(n);
}
