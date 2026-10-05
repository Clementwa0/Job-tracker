import { TECH_TERMS, termKey } from "./importGuard";
import type { ResumeData } from "./types";

/**
 * General ATS score: "How ATS-friendly and complete is this resume?"
 *
 * Deterministic and explainable: no AI, no network, no clock. The same resume always gets the same score.
 * It deliberately does NOT compare the resume with a job description; that is the separate Job Match feature
 * ("How well does this resume match this particular job?").
 *
 * Six categories, each scored 0-100, combined with fixed weights (the weights are exposed on `breakdown`, and
 * `score` is exactly the weighted sum of the displayed category values):
 *   Contact & Completeness 15% | Experience & Impact 25% | Skills & Keywords 25%
 *   ATS Formatting 15% | Content Quality 10% | Education & Certifications 10%
 * Every deduction is paired with a short recommendation in `issues`.
 */

export interface AtsResult {
  score: number;
  band: string;
  /** One entry per category; `value` is 0-100 and `weight` its share of the final score (weights sum to 1). */
  breakdown: { label: string; value: number; weight?: number }[];
  issues: string[];
  wins: string[];
}

export function scoreBand(s: number) {
  return s >= 90 ? "Excellent" : s >= 80 ? "Strong" : s >= 70 ? "Good" : s >= 60 ? "Average" : "Weak";
}

/* ------------------------------------------------------------------------------------------------ */
/* Vocabulary                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

/** Base forms; past tense, -ing and third person are matched by `stems()`. */
const ACTION_VERBS = new Set(`accelerate achieve administer advise analyze analyse answer apply architect arrange assemble assess assign audit automate balance bill boost budget build calculate capture centralize champion clean clarify coach collaborate collect communicate compile complete compose conduct configure connect consolidate construct consult contribute control convert coordinate create cut debug decrease define deliver demonstrate deploy design detect develop devise diagnose direct document double draft drive edit educate eliminate enable encourage engineer enhance ensure establish estimate evaluate examine execute expand expedite facilitate finalize fix forecast formulate found generate grow guide handle head identify implement improve increase initiate inspect install instruct integrate interview introduce investigate launch lead learn maintain manage map market measure mediate mentor merge migrate model modernize monitor motivate negotiate observe onboard operate optimize orchestrate organize oversee own partner perform pilot plan present prepare prioritize process procure produce program promote propose prototype provide publish purchase qualify rebuild recommend reconcile record recruit redesign reduce refactor refine register reinforce release remodel renegotiate repair replace report represent research reset resolve restructure retain retrieve review revise revamp roll run sale save schedule secure select serve set simplify solve source spearhead staff standardize streamline strengthen submit supervise supply support surpass sustain synchronize teach test train transform translate triple troubleshoot tune uncover unify update upgrade validate verify visualize write
built led ran drove grew wrote taught sold won oversaw spoke troubleshot sent held kept met began brought chose found gave paid`.split(/\s+/));
/** Openers that describe a duty instead of an accomplishment. */
const WEAK_OPENERS = new Set(["helped", "worked", "assisted", "participated", "involved", "responsible", "tasked", "duties", "tasks", "was", "were", "have", "had", "did"]);
/** Words ending in -ed that are adjectives, not verbs. */
const NOT_VERBS = new Set(["detailed", "skilled", "experienced", "motivated", "dedicated", "qualified", "certified", "talented", "accomplished", "seasoned", "advanced", "related", "based", "limited", "committed", "focused", "named", "needed", "interested", "excited", "organised"]);

const WEAK_PHRASES = ["responsible for", "worked on", "worked with", "helped with", "helped to", "duties included", "tasks included", "in charge of", "assisted with", "assisted in", "involved in", "participated in", "tasked with", "various", "stuff", "things", "etc", "and so on"];
const WEAK_RE = new RegExp(`\\b(?:${WEAK_PHRASES.join("|")})\\b`, "gi");
const BUZZWORDS = ["results-driven", "results driven", "passionate", "dynamic", "highly motivated", "self-motivated", "hard-working", "hardworking", "hard working", "team player", "proven track record", "detail-oriented", "detail oriented", "go-getter", "self-starter", "think outside the box", "synergy", "motivated individual", "strong work ethic", "fast learner", "quick learner", "excellent communication skills", "references available"];
const GENERIC_SKILL_RE = /^(?:(?:good|excellent|strong|great|effective)\s+)?(?:communication(?:\s+skills?)?|team\s*work|team\s*player|leadership(?:\s+skills?)?|hard[\s-]*work(?:ing|er)|fast\s+learner|self[\s-]*starter|willing\s+to\s+learn|dedicated|enthusiastic|responsible|professional|organi[sz]ed|quick\s+learner|detail[\s-]*oriented|self[\s-]*motivated|problem[\s-]*solving|time\s+management|multi[\s-]?tasking|interpersonal(?:\s+skills?)?|people\s+skills?|work\s+ethic|adaptab\w*|flexib\w*|creativ\w*|organi[sz]ation(?:al)?(?:\s+skills?)?|critical\s+thinking|computer\s+skills?|computer\s+literate|internet|typing|punctual\w*|reliab\w*|honest\w*|motivated|positive\s+attitude)$/i;
const PROFESSION_RE = /\b(engineer|developer|designer|analyst|manager|accountant|administrator|specialist|consultant|technician|teacher|lecturer|nurse|officer|coordinator|assistant|executive|director|architect|scientist|marketer|writer|editor|lawyer|attorney|auditor|clerk|supervisor|cashier|driver|salesperson|recruiter|researcher|student|graduate|programmer|intern|trainer|technologist|pharmacist|mechanic|electrician|accounting|marketing|sales|finance|engineering|development|design|support|operations|teaching|nursing|logistics|banking|software|data)\b/i;
const ROLE_STOP = new Set(["senior", "junior", "lead", "chief", "head", "principal", "associate", "intern", "trainee", "the", "and", "of", "for"]);

/** Searchable domain vocabulary beyond the shared technology list: tools, methods and business terms. */
const KNOWN_TERMS = new Set([
  ...TECH_TERMS,
  ...`react,next.js,node.js,express,redux,html5,css3,c++,c#,.net,windows,macos,workstation,printer,router,firewall,vpn,dns,tcp/ip,lan,wan,wifi,server,network,database,cloud,api,rest api,graphql,microservice,web application,website,web app,mobile app,software,hardware,infrastructure,automation,deployment,monitoring,debugging,testing,unit testing,quality assurance,version control,ci/cd,machine learning,data analysis,data science,data entry,data visualization,power bi,excel,microsoft excel,microsoft office,microsoft word,word,powerpoint,outlook,google workspace,google analytics,active directory,office 365,microsoft 365,help desk,technical support,troubleshooting,cybersecurity,security,encryption,linux,ubuntu,sap,erp,crm,hubspot,salesforce,quickbooks,xero,sage,tally,zoho,seo,social media,content creation,copywriting,email marketing,campaign,branding,market research,customer service,customer support,customer,client,stakeholder,vendor,supplier,procurement,logistics,supply chain,inventory,warehouse,budgeting,budget,forecasting,financial reporting,accounting,bookkeeping,payroll,invoicing,invoice,reconciliation,auditing,audit,tax,compliance,risk management,reporting,dashboard,documentation,project management,product management,process improvement,workflow,scheduling,negotiation,recruitment,onboarding,training,coaching,sales,revenue,lead generation,analytics,agile,scrum,kanban,lean,six sigma,teaching,curriculum,lesson planning,patient care,nursing,pharmacy,laboratory,clinical,research,policy,fundraising,grant writing,event planning,translation,photography,video editing,autocad,solidworks,photoshop,illustrator,figma`.split(",").map((t) => t.trim()).filter(Boolean).map(termKey),
]);

/* ------------------------------------------------------------------------------------------------ */
/* Small helpers                                                                                    */
/* ------------------------------------------------------------------------------------------------ */

const clamp = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0);
const words = (text: string) => text.trim().split(/\s+/).filter(Boolean);
const wordCount = (text: string) => words(text).length;
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
/** Saturating curve: early items count most, piling on more adds less (0 -> 0, large -> 1). */
const saturate = (x: number, scale: number) => 1 - Math.exp(-Math.max(0, x) / scale);

/** Normalised 1-3 word keys of a text (plural/punctuation-insensitive, alias-aware via termKey). */
function ngramKeys(text: string): Set<string> {
  const tokens = text.toLowerCase().replace(/[/&]/g, " ").match(/[a-z0-9][a-z0-9+#.]*/g)?.map((t) => t.replace(/\.+$/, "")) ?? [];
  const keys = new Set<string>();
  for (let i = 0; i < tokens.length; i++) for (let n = 1; n <= 3 && i + n <= tokens.length; n++) keys.add(termKey(tokens.slice(i, i + n).join(" ")));
  keys.delete("");
  return keys;
}

/** Distinct known (or resume-declared) terms found in a text. */
const termsIn = (text: string, extra?: Set<string>) => [...ngramKeys(text)].filter((key) => KNOWN_TERMS.has(key) || extra?.has(key));

function stems(word: string): string[] {
  const out = [word];
  if (word.endsWith("ied")) out.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("ed")) { out.push(word.slice(0, -2), word.slice(0, -1)); if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) out.push(word.slice(0, -3)); }
  if (word.endsWith("ing")) { out.push(word.slice(0, -3), `${word.slice(0, -3)}e`); if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) out.push(word.slice(0, -4)); }
  if (word.endsWith("ies")) out.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es")) out.push(word.slice(0, -2));
  if (word.endsWith("s")) out.push(word.slice(0, -1));
  return out;
}

/** First meaningful word of a bullet (skips bullet symbols and leading adverbs such as "Successfully"). */
function opener(text: string): string {
  const list = text.replace(/^[\s•\-*–—·▪●◦]+/, "").toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z]/g, "")).filter(Boolean);
  return (list[0] && list[0].endsWith("ly") && list.length > 1 ? list[1] : list[0]) ?? "";
}
function isActionVerb(word: string): boolean {
  if (!word || WEAK_OPENERS.has(word) || NOT_VERBS.has(word)) return false;
  return stems(word).some((s) => ACTION_VERBS.has(s)) || (word.length > 4 && word.endsWith("ed"));
}

const YEAR_RE = /\b(?:19|20)\d{2}\b/g;
const VERSION_RE = /\b(?:windows|office|microsoft|ubuntu|python|angular|ios|android|ipv|html|php|java|server|macos|excel)\s?\d+(?:\.\d+)*\b/gi;
/** A real figure (count, %, money, time saved). Years and product versions ("Windows 10", "2021") do not count. */
const isQuantified = (text: string) => /\d|[$£€]|\b(?:hundreds?|thousands?|millions?|dozens?|doubled|tripled|halved)\b/i.test(text.replace(YEAR_RE, " ").replace(VERSION_RE, " "));
/** Splits on sentence ends without regex lookbehind (unsupported in older Safari). */
const sentencesOf = (text: string) => text.replace(/([.!?])\s+/g, "$1\n").split(/\n+/).map((t) => t.trim()).filter(Boolean);
const weakPhrasesIn = (text: string) => [...new Set((text.toLowerCase().match(WEAK_RE) ?? []).map((m) => m.toLowerCase()))];
const symbolRe = /[\u2190-\u21FF\u2300-\u23FF\u25A0-\u27BF\u2B00-\u2BFF\u{1F000}-\u{1FAFF}]/u;

type Category = "contact" | "experience" | "skills" | "format" | "content" | "education";
interface Notes {
  issue: (category: Category, key: string, text: string) => void;
  win: (key: string, text: string) => void;
}

interface BulletInfo { score: number; verb: boolean; quantified: boolean; weak: string[]; words: number; terms: number }

/** One experience bullet, 0-100: action verb 30, clarity/length 20, terminology 15, no weak phrase 15, measurable result 20. */
function scoreBullet(raw: string, known: Set<string>): BulletInfo {
  const text = raw.replace(/^[\s•\-*–—·▪●◦]+/, "").trim();
  const n = wordCount(text);
  const verb = isActionVerb(opener(text));
  const weak = weakPhrasesIn(text);
  const quantified = isQuantified(text);
  const terms = termsIn(text, known).length;
  const score = (verb ? 30 : 0) + (n >= 6 && n <= 30 ? 20 : n >= 4 && n <= 40 ? 10 : 0) + (terms >= 2 ? 15 : terms === 1 ? 10 : 0) + (weak.length ? 0 : 15) + (quantified ? 20 : 0);
  return { score, verb, quantified, weak, words: n, terms };
}

/* ------------------------------------------------------------------------------------------------ */
/* 1. Contact & Completeness (15%)                                                                  */
/* ------------------------------------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function scoreContact(d: ResumeData, notes: Notes): number {
  const c = d.contact;
  const has = (s?: string) => Boolean(s?.trim());
  let contact = 0;
  if (has(c.fullName)) contact += 25; else notes.issue("contact", "name", "Add your full name.");
  if (!has(c.email)) notes.issue("contact", "email", "Add an email address.");
  else if (EMAIL_RE.test(c.email.trim())) contact += 25;
  else { contact += 10; notes.issue("contact", "email", "Check your email address format."); }
  if (!has(c.phone)) notes.issue("contact", "phone", "Add a phone number.");
  else if (c.phone.replace(/\D/g, "").length >= 7) contact += 20;
  else { contact += 10; notes.issue("contact", "phone", "Check your phone number."); }
  if (has(c.location)) contact += 15; else notes.issue("contact", "location", "Add your location (city and country).");
  if (has(c.title)) contact += 10; else notes.issue("contact", "title", "Add a job title under your name.");
  if ([c.linkedin, c.github, c.website].some(has)) contact += 5; else notes.issue("contact", "link", "Consider adding a LinkedIn or portfolio link.");

  // Sections: presence only. Quality is judged in the other categories (summary: Content Quality; education: its own category).
  const hasExperience = (d.experience ?? []).some((x) => x.company.trim() || x.role.trim() || x.bullets.length);
  const hasProjects = (d.projects ?? []).some((p) => p.description.trim());
  const hasSkills = (d.skills ?? []).some((g) => g.items.length);
  let sections = 0;
  if (d.summary.trim()) sections += 30; else notes.issue("content", "summary-missing", "Add a professional summary.");
  if (hasExperience) sections += 40;
  else { if (hasProjects) sections += 20; notes.issue("experience", "experience-missing", "Add your work experience, internships or volunteer work."); }
  if (hasSkills) sections += 30; else notes.issue("skills", "skills-missing", "Add a skills section with your key tools and technologies.");

  const value = clamp(contact * 0.55 + sections * 0.45);
  if (contact >= 90) notes.win("contact", "Contact details are complete.");
  if (sections === 100) notes.win("sections", "All key sections are present.");
  return value;
}

/* ------------------------------------------------------------------------------------------------ */
/* 2. Experience & Impact (25%)                                                                     */
/* ------------------------------------------------------------------------------------------------ */

function scoreExperience(d: ResumeData, notes: Notes, known: Set<string>): { value: number; bullets: number } {
  const entries = (d.experience ?? []).filter((x) => x.company.trim() || x.role.trim() || x.bullets.length);
  const expBullets = entries.flatMap((x) => x.bullets.map((b) => b.trim()).filter(Boolean));
  // With no work experience, project descriptions are the only evidence of what the candidate did (capped below).
  const fromProjects = expBullets.length === 0;
  const pool = fromProjects
    ? (d.projects ?? []).flatMap((p) => sentencesOf(p.description))
    : expBullets;
  const infos = pool.map((b) => scoreBullet(b, known));
  const avg = infos.length ? infos.reduce((n, b) => n + b.score, 0) / infos.length : 0;

  const noVerb = infos.filter((b) => !b.verb && !b.weak.length).length;
  const short = infos.filter((b) => b.words < 4).length;
  const quantified = infos.filter((b) => b.quantified).length;
  const strong = infos.filter((b) => b.verb && b.quantified).length;
  if (noVerb) notes.issue("experience", "action-verbs", noVerb === 1 ? "One bullet lacks a strong action verb." : `${noVerb} bullets lack strong action verbs.`);
  if (short) notes.issue("experience", "short-bullets", `${short} ${plural(short, "bullet is", "bullets are")} too short to say much. Add what you did and the outcome.`);
  if (infos.length >= 3 && quantified / infos.length < 0.2) notes.issue("experience", "quantify", "Consider adding measurable results to some experience bullets.");
  if (strong) notes.win("impact", `${strong} high-impact ${plural(strong, "bullet", "bullets")} with measurable results.`);
  if (infos.length >= 3 && infos.filter((b) => b.verb).length / infos.length >= 0.8) notes.win("verbs", "Most bullets start with strong action verbs.");

  // Project descriptions are weaker evidence than work experience, so they count at 60%.
  const evidence = fromProjects ? avg * 0.6 : avg;
  if (!entries.length) return { value: clamp(evidence), bullets: infos.length };

  // Structure per role: title 15, company 15, dates 20, bullets 50 (3+ bullets is full credit).
  let structure = 0;
  let noBullets = 0, oneBullet = 0, noDates = 0, noTitle = 0;
  for (const x of entries) {
    const n = x.bullets.filter((b) => b.trim()).length;
    const dated = Boolean(x.startDate.trim()) && (x.current || Boolean(x.endDate.trim()));
    structure += (x.role.trim() ? 15 : 0) + (x.company.trim() ? 15 : 0) + (x.startDate.trim() ? 10 : 0) + (x.current || x.endDate.trim() ? 10 : 0) + (n >= 3 ? 50 : n === 2 ? 35 : n === 1 ? 18 : 0);
    if (n === 0) noBullets++; else if (n === 1) oneBullet++;
    if (!dated) noDates++;
    if (!x.role.trim() || !x.company.trim()) noTitle++;
  }
  structure /= entries.length;
  if (noBullets) notes.issue("experience", "role-bullets", `${noBullets} ${plural(noBullets, "role has", "roles have")} no bullet points. Describe what you did and achieved.`);
  else if (oneBullet) notes.issue("experience", "role-bullets", `Add 2-4 bullets to ${plural(oneBullet, "the role that has", "roles that have")} only one.`);
  if (noDates) notes.issue("experience", "role-dates", "Add start and end dates to every role.");
  if (noTitle) notes.issue("experience", "role-title", "Add a job title and company name to every role.");
  return { value: clamp(evidence * 0.65 + structure * 0.35), bullets: infos.length };
}

/* ------------------------------------------------------------------------------------------------ */
/* 3. Skills & Keywords (25%)                                                                       */
/* ------------------------------------------------------------------------------------------------ */

interface SkillItem { text: string; key: string; generic: boolean; known: boolean }

function parseSkills(d: ResumeData) {
  const items: SkillItem[] = [];
  const seen = new Set<string>();
  const categories = new Set<string>();
  let duplicates = 0, emptyGroups = 0, overlong = 0;
  for (const group of d.skills ?? []) {
    const parts = group.items.flatMap((item) => item.split(/[,;|]/)).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) { emptyGroups++; continue; }
    categories.add(group.category.trim().toLowerCase());
    for (const text of parts) {
      const key = termKey(text);
      if (!key) continue;
      if (seen.has(key)) { duplicates++; continue; }
      seen.add(key);
      if (wordCount(text) > 6 || text.length > 50) overlong++;
      items.push({ text, key, generic: GENERIC_SKILL_RE.test(text.trim()), known: KNOWN_TERMS.has(key) || termsIn(text).length > 0 });
    }
  }
  return { items, categories: categories.size, duplicates, emptyGroups, overlong };
}

/**
 * Quality of the resume's searchable content (not a raw skill count):
 * weighted skill breadth 30 (diminishing returns; generic skills count little), category diversity 20, skills backed by
 * experience 20, distinct searchable terms across the whole resume 20, tidiness (duplicates, empty/overlong entries) 10.
 */
function scoreSkills(d: ResumeData, notes: Notes, body: string): { value: number; known: Set<string> } {
  const { items, categories, duplicates, emptyGroups, overlong } = parseSkills(d);
  const meaningful = items.filter((s) => !s.generic);
  const generic = items.filter((s) => s.generic);
  const weighted = items.reduce((n, s) => n + (s.generic ? 0.25 : s.known ? 1 : 0.7), 0);
  const known = new Set(meaningful.map((s) => s.key));

  const breadth = 30 * saturate(weighted, 5);
  const expected = Math.min(3, Math.max(1, Math.ceil(meaningful.length / 4)));
  const diversity = meaningful.length ? 20 * Math.min(1, categories / expected) : 0;

  // Evidence: does the body of the resume actually use the listed skills?
  const bodyKeys = ngramKeys(body);
  const bodyLower = body.toLowerCase();
  const used = meaningful.filter((s) => bodyKeys.has(s.key) || (s.text.length >= 3 && new RegExp(`(?:^|[^a-z0-9])${s.text.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![a-z0-9])`).test(bodyLower))).length;
  const enoughBody = wordCount(body) >= 30;
  const usage = meaningful.length ? used / meaningful.length : 0;
  const evidence = !meaningful.length ? 0 : enoughBody ? 20 * usage : 10;

  // Distinct searchable terms: skills, project tech, certifications, job titles and known terms used in the text.
  const searchable = new Set<string>(known);
  for (const p of d.projects ?? []) for (const t of p.tech) searchable.add(termKey(t));
  for (const c of d.certifications ?? []) if (c.name.trim()) searchable.add(termKey(c.name));
  for (const x of d.experience ?? []) if (x.role.trim()) searchable.add(termKey(x.role));
  if (d.contact.title.trim()) searchable.add(termKey(d.contact.title));
  for (const key of ngramKeys(body)) if (KNOWN_TERMS.has(key)) searchable.add(key);
  searchable.delete("");
  const coverage = 20 * saturate(searchable.size, 10);

  const tidy = items.length || emptyGroups ? Math.max(0, 10 - 3 * duplicates - 4 * emptyGroups - 2 * overlong) : 0;
  const value = clamp(breadth + diversity + evidence + coverage + tidy);

  const genericHeavy = generic.length >= 2 && generic.length / Math.max(1, items.length) >= 0.5;
  if (!items.length && !emptyGroups) { /* "skills-missing" is reported with the other missing sections */ }
  else if (genericHeavy) notes.issue("skills", "generic-skills", `Replace generic skills such as "${generic[0].text}" with specific tools or technologies.`);
  else if (weighted < 3) notes.issue("skills", "more-skills", "Add more relevant technical skills.");
  if (duplicates) notes.issue("skills", "duplicate-skills", `Remove ${plural(duplicates, "a duplicate skill", `${duplicates} duplicate skills`)}.`);
  if (emptyGroups) notes.issue("skills", "empty-groups", "Remove or fill empty skill categories.");
  if (overlong) notes.issue("skills", "overlong-skills", "Keep each skill short, for example \"Python\" rather than a sentence.");
  if (meaningful.length >= 8 && categories <= 1) notes.issue("skills", "group-skills", "Group your skills into categories such as Languages, Tools and Frameworks.");
  if (meaningful.length >= 3 && enoughBody && usage < 0.25) notes.issue("skills", "skill-evidence", "Mention your key skills in your summary or experience bullets, not only in the skills list.");
  if (meaningful.length >= 4 && categories >= 2) notes.win("skill-groups", `Skills are grouped into ${categories} categories.`);
  if (meaningful.length >= 3 && enoughBody && usage >= 0.7) notes.win("skill-evidence", "Your listed skills are backed up by your experience.");
  if (searchable.size >= 15) notes.win("keywords", "Good keyword coverage across skills, titles and experience.");
  return { value, known };
}

/* ------------------------------------------------------------------------------------------------ */
/* 4. ATS Formatting (15%)                                                                          */
/* ------------------------------------------------------------------------------------------------ */

type DateKind = "iso" | "year" | "name" | "slash" | "other";
interface ParsedDate { kind: DateKind; lo: number; hi: number }
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Understands 2021-03, 03/2021, Mar 2021, March 2021 and 2021. "Present"/"Current" and empty return null. */
function parseDate(raw: string): ParsedDate | null {
  const s = raw.trim();
  if (!s || /^(present|current|now|ongoing|today)$/i.test(s)) return null;
  const month = (y: number, m: number, kind: DateKind): ParsedDate | null => (m >= 1 && m <= 12 ? { kind, lo: y * 12 + m - 1, hi: y * 12 + m - 1 } : null);
  let m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m) return month(Number(m[1]), Number(m[2]), "iso") ?? { kind: "other", lo: 0, hi: 0 };
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return month(Number(m[2]), Number(m[1]), "slash") ?? { kind: "other", lo: 0, hi: 0 };
  m = s.match(/^([A-Za-z]{3,9})\.?,?\s+(\d{4})$/);
  const idx = m ? MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) : -1;
  if (m && idx >= 0) return month(Number(m[2]), idx + 1, "name");
  m = s.match(/^(\d{4})$/);
  if (m) return { kind: "year", lo: Number(m[1]) * 12, hi: Number(m[1]) * 12 + 11 };
  return { kind: "other", lo: 0, hi: 0 };
}

function scoreFormatting(d: ResumeData, notes: Notes): number {
  const experience = d.experience ?? [];
  const education = d.education ?? [];
  const projects = d.projects ?? [];
  const bullets = experience.flatMap((x) => x.bullets.map((b) => b.trim()).filter(Boolean));
  const texts = [d.summary, ...bullets, ...projects.map((p) => p.description)].filter((t) => t.trim());
  let score = 100;
  const lose = (points: number, cap: number, count: number) => { score -= Math.min(cap, points * count); };

  // Parser-friendly text.
  const longBullets = bullets.filter((b) => b.length > 240 || wordCount(b) > 40).length;
  const caps = texts.filter((t) => t.length > 12 && /[A-Z]/.test(t) && t === t.toUpperCase()).length;
  const symbols = texts.filter((t) => symbolRe.test(t)).length;
  lose(6, 24, longBullets); lose(6, 18, caps); lose(6, 18, symbols);
  if (longBullets) notes.issue("format", "long-bullets", `${longBullets} ${plural(longBullets, "bullet is", "bullets are")} unusually long. Split or tighten ${plural(longBullets, "it", "them")}.`);
  if (caps) notes.issue("format", "all-caps", "Avoid writing whole bullets or paragraphs in ALL CAPS.");
  if (symbols) notes.issue("format", "symbols", "Replace decorative symbols and emoji with plain text.");

  // Length of the whole resume.
  const all = [d.summary, d.contact.title, ...experience.flatMap((x) => [x.role, x.company, ...x.bullets]), ...education.flatMap((e) => [e.school, e.degree, e.field, e.notes]),
    ...projects.flatMap((p) => [p.name, p.description, ...p.tech]), ...(d.skills ?? []).flatMap((g) => [g.category, ...g.items]), ...(d.certifications ?? []).flatMap((c) => [c.name, c.issuer])];
  const total = all.reduce((n, t) => n + wordCount(t), 0);
  if (total < 80) { score -= 35 + Math.round((80 - total) * 0.5); notes.issue("format", "length", "Resume is extremely short. Add your experience, skills and education."); }
  else if (total < 200) { score -= 15; notes.issue("format", "length", "Resume is quite short. Aim for about 350+ words."); }
  else if (total > 1400) { score -= 20; notes.issue("format", "length", "Resume is very long. Trim it to the most relevant points."); }
  else if (total > 1000) { score -= 10; notes.issue("format", "length", "Resume is long. Trim it to the most relevant points."); }

  // Over-long sections and empty entries.
  const heavyRoles = experience.filter((x) => x.bullets.length > 10 || x.bullets.reduce((n, b) => n + wordCount(b), 0) > 350).length;
  const bigSkills = (d.skills ?? []).reduce((n, g) => n + g.items.length, 0) > 60;
  const longProjects = projects.filter((p) => wordCount(p.description) > 100).length;
  lose(5, 15, heavyRoles + (bigSkills ? 1 : 0) + longProjects);
  if (heavyRoles || longProjects) notes.issue("format", "long-sections", "Some sections are very long. Keep each role or project to its most relevant points.");
  if (bigSkills) notes.issue("format", "long-skills", "Your skills list is very long. Keep the most relevant skills.");
  const emptyEntries = experience.filter((x) => !x.role.trim() && !x.company.trim() && !x.bullets.length).length
    + education.filter((e) => !e.school.trim() && !e.degree.trim() && !e.field.trim()).length
    + projects.filter((p) => !p.name.trim() && !p.description.trim()).length
    + (d.certifications ?? []).filter((c) => !c.name.trim()).length;
  lose(5, 20, emptyEntries);
  if (emptyEntries) notes.issue("format", "empty-entries", "Remove or complete empty sections and entries.");

  // Repeated content: exact or near-identical bullets.
  const seen: Set<string>[] = [];
  let repeats = 0;
  for (const b of bullets) {
    const set = new Set(norm(b).split(" ").filter((w) => w.length > 2));
    if (set.size >= 4 && seen.some((o) => { const both = [...set].filter((w) => o.has(w)).length; return both / (set.size + o.size - both) >= 0.85; })) repeats++;
    else seen.push(set);
  }
  lose(6, 18, repeats);
  if (repeats) notes.issue("format", "repeated", `${repeats} ${plural(repeats, "bullet repeats", "bullets repeat")} other content. Remove or reword ${plural(repeats, "it", "them")}.`);

  // Whitespace that parsers read as stray lines or gaps.
  const spacey = [...texts, ...experience.flatMap((x) => [x.role, x.company])].filter((t) => /[ \t]{3,}/.test(t) || /\n\s*\n/.test(t)).length;
  lose(3, 9, spacey);
  if (spacey) notes.issue("format", "whitespace", "Remove extra spaces and blank lines from your text.");

  // Dates: only what can be detected from the data.
  const spans = [...experience.map((x) => ({ start: x.startDate, end: x.endDate, current: x.current })), ...education.map((e) => ({ start: e.startDate, end: e.endDate, current: false }))];
  let backwards = 0, currentWithEnd = 0;
  for (const s of spans) {
    const a = parseDate(s.start), b = parseDate(s.end);
    if (a && b && a.kind !== "other" && b.kind !== "other" && a.lo > b.hi) backwards++;
    if (s.current && s.end.trim()) currentWithEnd++;
  }
  const kinds = new Set(experience.flatMap((x) => [parseDate(x.startDate), parseDate(x.endDate)]).filter((p): p is ParsedDate => p !== null).map((p) => p.kind));
  lose(8, 16, backwards); lose(4, 8, currentWithEnd);
  if (backwards) notes.issue("format", "dates-order", "A start date is later than its end date. Check your dates.");
  if (currentWithEnd) notes.issue("format", "dates-current", "A role marked as current also has an end date. Clear one of them.");
  if (kinds.has("other") || kinds.size > 1) { score -= 4; notes.issue("format", "dates-format", "Use one date format throughout, such as \"Jan 2021\" or \"2021-01\"."); }
  const starts = experience.map((x) => parseDate(x.startDate));
  if (starts.some((a, i) => a && a.kind !== "other" && starts.slice(i + 1).some((b) => b && b.kind !== "other" && b.lo > a.hi))) {
    score -= 3;
    notes.issue("format", "dates-chronology", "List your roles with the most recent first.");
  }

  if (score >= 100) notes.win("format", "No ATS formatting problems detected.");
  if (total >= 80 && (d.template === "mono" || d.template === "aurora")) notes.win("template", "Template uses a parser-friendly single column.");
  return clamp(score);
}

/* ------------------------------------------------------------------------------------------------ */
/* 5. Content Quality (10%)                                                                         */
/* ------------------------------------------------------------------------------------------------ */

const FIRST_PERSON_RE = /\b(?:I|my|My|me|Me|myself)\b/g;
const quoted = (list: string[]) => list.slice(0, 2).map((p) => `"${p}"`).join(" or ");

/** Summary 45% (presence 10, length 20, focus 20, relevant skills 20, no filler 20, no first person 10) + bullet language 55%. */
function scoreContent(d: ResumeData, notes: Notes, known: Set<string>): number {
  const summary = d.summary.trim();
  const bullets = (d.experience ?? []).flatMap((x) => x.bullets.map((b) => b.trim()).filter(Boolean));
  const pool = bullets.length ? bullets : (d.projects ?? []).map((p) => p.description.trim()).filter(Boolean);
  const buzzFound = new Set<string>();
  let firstPerson = 0;
  const buzzIn = (text: string) => BUZZWORDS.filter((b) => text.toLowerCase().includes(b));

  let summaryScore = 0;
  if (summary) {
    const n = wordCount(summary);
    const sentences = sentencesOf(summary).length;
    let length = n >= 25 && n <= 80 ? 20 : (n >= 15 && n < 25) || (n > 80 && n <= 110) ? 12 : (n >= 8 && n < 15) || (n > 110 && n <= 150) ? 5 : 0;
    if (sentences > 5) length = Math.min(length, 10);
    const lower = summary.toLowerCase();
    const titleWords = [d.contact.title, ...(d.experience ?? []).map((x) => x.role)].flatMap((t) => norm(t).split(" ")).filter((w) => w.length >= 4 && !ROLE_STOP.has(w));
    const terms = termsIn(summary, known).length;
    const focus = PROFESSION_RE.test(summary) || titleWords.some((w) => lower.includes(w)) ? 20 : terms ? 8 : 0;
    const skillPoints = terms >= 2 ? 20 : terms === 1 ? 10 : 0;
    const filler = buzzIn(summary);
    filler.forEach((f) => buzzFound.add(f));
    const person = (summary.match(FIRST_PERSON_RE) ?? []).length;
    firstPerson += person;
    summaryScore = 10 + length + focus + skillPoints + (filler.length === 0 ? 20 : filler.length === 1 ? 10 : 0) + (person === 0 ? 10 : person === 1 ? 5 : 0);

    if (n < 15) notes.issue("content", "summary-short", "Your summary is too short. Name your focus and key skills.");
    else if (n > 110 || sentences > 5) notes.issue("content", "summary-long", "Your summary is too long. Keep it to 2-4 sentences.");
    if (!focus) notes.issue("content", "summary-focus", "Name your professional focus, such as your job title, in the summary.");
    else if (focus < 20) notes.issue("content", "summary-focus", "State your professional focus more clearly in the summary.");
    if (skillPoints < 20) notes.issue("content", "summary-skills", "Mention two or three key skills or tools in your summary.");
    if (n >= 25 && n <= 80 && focus === 20 && skillPoints === 20 && !filler.length && !person) notes.win("summary", "Your summary is concise, focused and skill-rich.");
  }

  if (!pool.length) return clamp(summaryScore);

  const infos = pool.map((b) => ({ weak: weakPhrasesIn(b), buzz: buzzIn(b), person: (b.match(FIRST_PERSON_RE) ?? []).length, first: opener(b) }));
  const weakBullets = infos.filter((i) => i.weak.length);
  infos.forEach((i) => i.buzz.forEach((b) => buzzFound.add(b)));
  const personBullets = infos.filter((i) => i.person).length;
  firstPerson += infos.reduce((n, i) => n + i.person, 0);
  const counts = new Map<string, number>();
  for (const i of infos) if (i.first) counts.set(i.first, (counts.get(i.first) ?? 0) + 1);
  const [topWord, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? ["", 0];
  const share = topCount / infos.length;

  let language = 100;
  language -= Math.min(50, Math.round((weakBullets.length / infos.length) * 100));
  language -= Math.min(25, 10 * infos.filter((i) => i.buzz.length).length);
  language -= Math.min(16, 8 * personBullets);
  if (infos.length >= 4 && share > 0.4) language -= Math.min(20, Math.round((share - 0.4) * 100));

  if (weakBullets.length) notes.issue("content", "weak-phrases", `Remove generic phrases such as ${quoted([...new Set(weakBullets.flatMap((i) => i.weak))])}.`);
  // "Responsible"/"Worked"... openers are already covered by the weak-phrase recommendation.
  if (infos.length >= 4 && share > 0.4 && !WEAK_OPENERS.has(topWord)) notes.issue("content", "repeated-openers", `Vary how your bullets begin. ${topCount} start with "${topWord}".`);
  if (language >= 100) notes.win("language", "Your bullets avoid vague or filler phrases.");

  if (buzzFound.size) notes.issue("content", "buzzwords", `Replace generic buzzwords such as ${quoted([...buzzFound])} with specific facts.`);
  if (firstPerson) notes.issue("content", "first-person", "Avoid first-person words like \"I\" and \"my\".");

  return clamp(summary ? summaryScore * 0.45 + language * 0.55 : language * 0.55);
}

/* ------------------------------------------------------------------------------------------------ */
/* 6. Education & Certifications (10%)                                                              */
/* ------------------------------------------------------------------------------------------------ */

/**
 * Education (best entry: institution 35, degree/qualification 35, field 10, dates 20) plus up to half-credit from
 * certifications. Certifications can only add: not having any never lowers the score below what education earns.
 */
function scoreEducation(d: ResumeData, notes: Notes): number {
  let education = 0;
  let missing: string[] = [];
  for (const e of d.education ?? []) {
    const parts: [boolean, number, string][] = [
      [Boolean(e.school.trim()), 35, "institution"], [Boolean(e.degree.trim()), 35, "degree or qualification"],
      [Boolean(e.field.trim()), 10, "field of study"], [Boolean(e.startDate.trim() || e.endDate.trim()), 20, "dates"],
    ];
    const value = parts.reduce((n, [ok, points]) => n + (ok ? points : 0), 0);
    if (value > education || (value === education && !missing.length && value < 100)) { education = value; missing = parts.filter(([ok]) => !ok).map(([, , label]) => label); }
  }
  if (!(d.education ?? []).length) notes.issue("education", "education-missing", "Add your education or training, if you have any.");
  else if (missing.length) notes.issue("education", "education-details", `Complete your education details: add the ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`);
  else notes.win("education", "Education details are complete.");

  const certs = (d.certifications ?? []).filter((c) => c.name.trim());
  const effective = certs.reduce((n, c) => n + (c.issuer.trim() ? 1 : 0.5), 0);
  const certificates = effective >= 1 ? Math.min(100, 60 + 20 * (effective - 1)) : effective * 60;
  if (certs.some((c) => !c.issuer.trim())) notes.issue("education", "cert-issuer", "Add the issuing organisation to your certifications.");
  if (certs.length && certs.every((c) => c.issuer.trim())) notes.win("certs", "Certifications are listed with their issuers.");
  return clamp(Math.min(100, education + certificates * 0.5));
}

/* ------------------------------------------------------------------------------------------------ */
/* Final score                                                                                      */
/* ------------------------------------------------------------------------------------------------ */

const CATEGORIES: { category: Category; label: string; weight: number }[] = [
  { category: "contact", label: "Contact & Completeness", weight: 0.15 },
  { category: "experience", label: "Experience & Impact", weight: 0.25 },
  { category: "skills", label: "Skills & Keywords", weight: 0.25 },
  { category: "format", label: "ATS Formatting", weight: 0.15 },
  { category: "content", label: "Content Quality", weight: 0.1 },
  { category: "education", label: "Education & Certifications", weight: 0.1 },
];
const MAX_ISSUES = 10;
const MAX_WINS = 6;

export function scoreResume(d: ResumeData): AtsResult {
  const found: { category: Category; key: string; text: string }[] = [];
  const wins = new Map<string, string>();
  const notes: Notes = {
    // One recommendation per key, so the same problem is never reported twice from different checks.
    issue: (category, key, text) => { if (!found.some((i) => i.key === key)) found.push({ category, key, text }); },
    win: (key, text) => { if (!wins.has(key)) wins.set(key, text); },
  };

  const body = [d.summary, ...(d.experience ?? []).flatMap((x) => [x.role, ...x.bullets]), ...(d.projects ?? []).flatMap((p) => [p.description, ...p.tech])].join("\n");
  const skills = scoreSkills(d, notes, body);
  const values: Record<Category, number> = {
    contact: scoreContact(d, notes),
    experience: scoreExperience(d, notes, skills.known).value,
    skills: skills.value,
    format: scoreFormatting(d, notes),
    content: scoreContent(d, notes, skills.known),
    education: scoreEducation(d, notes),
  };

  // The final score is the weighted sum of the displayed (rounded) category values.
  const score = clamp(CATEGORIES.reduce((n, c) => n + values[c.category] * c.weight, 0));
  // Most valuable fixes first: rank by the points a category still has to gain; ties keep the order found.
  const gain = (c: Category) => { const meta = CATEGORIES.find((m) => m.category === c)!; return meta.weight * (100 - values[c]); };
  const issues = found.map((i, order) => ({ ...i, order })).sort((a, b) => gain(b.category) - gain(a.category) || a.order - b.order).slice(0, MAX_ISSUES).map((i) => i.text);

  return {
    score,
    band: scoreBand(score),
    breakdown: CATEGORIES.map((c) => ({ label: c.label, value: values[c.category], weight: c.weight })),
    issues,
    wins: [...wins.values()].slice(0, MAX_WINS),
  };
}

export function resumeToText(d: ResumeData) {
  const c = d.contact;
  return [
    c.fullName, c.title, [c.email, c.phone, c.location].filter(Boolean).join(" | "),
    "SUMMARY", d.summary,
    "EXPERIENCE", ...d.experience.map((x) => `${x.role} at ${x.company} (${x.startDate} - ${x.current ? "Present" : x.endDate})\n${x.bullets.map((b) => "- " + b).join("\n")}`),
    "EDUCATION", ...d.education.map((x) => `${x.degree} ${x.field}, ${x.school}`),
    "PROJECTS", ...d.projects.map((p) => `${p.name}: ${p.description} [${p.tech.join(", ")}]`),
    "SKILLS", ...d.skills.map((s) => `${s.category}: ${s.items.join(", ")}`),
    "CERTIFICATIONS", ...d.certifications.map((x) => `${x.name} ${x.issuer} ${x.date}`),
  ].filter(Boolean).join("\n");
}
