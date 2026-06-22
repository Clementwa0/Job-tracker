const { chat } = require("../routes/ai/groq.service");
const { MODEL_FALLBACKS, TEMPERATURE } = require("../routes/ai/models.config");
const { slugify, buildJobSlug } = require("../utils/slugify");

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"];
const WORK_MODES = ["remote", "hybrid", "onsite"];
const SALARY_CONFIDENCE_THRESHOLD = 60;

const SYSTEM_PROMPT = `
You are an expert technical recruiter and job posting writer for an employer job board.

Generate professional, ATS-friendly job posting content from the employer's input.

RULES:
- Never invent company names, benefits, perks, or employer branding not present in the input.
- Never invent specific compensation if uncertain — set salaryMin and salaryMax to null and salaryConfidence below 50.
- Use only skills and requirements justified by the input.
- Be specific and actionable; avoid generic filler ("team player", "fast-paced environment" without context).
- responsibilities: 4–8 bullet strings (no leading bullets in strings).
- requirements: 4–8 bullet strings.
- preferredQualifications: 0–5 bullet strings.
- tags: max 10 concise skill strings (e.g. "React", "TypeScript").
- jobType: one of full-time, part-time, contract, internship.
- workMode: one of remote, hybrid, onsite.
- slug: lowercase hyphenated, no special chars, include role and location if known (e.g. frontend-engineer-nairobi).
- metaDescription: 150–160 characters for SEO, compelling and factual.
- seniorityLevel: e.g. Junior, Mid, Senior, Lead, or Intern.
- jobCategory: e.g. Engineering, Design, Marketing.
- suggestedFields: array of field names you are uncertain about (e.g. "salaryMin", "salaryMax", "workMode").

Return ONLY valid JSON with this exact shape:
{
  "title": "",
  "summary": "",
  "responsibilities": [],
  "requirements": [],
  "preferredQualifications": [],
  "tags": [],
  "jobCategory": "",
  "seniorityLevel": "",
  "jobType": "",
  "workMode": "",
  "salaryMin": null,
  "salaryMax": null,
  "salaryConfidence": 0,
  "location": "",
  "slug": "",
  "metaDescription": "",
  "suggestedFields": []
}
`.trim();

function asStringArray(value, max = 10) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string" && v.trim())
    .map((v) => v.trim().replace(/^[-•*]\s*/, ""))
    .slice(0, max);
}

function pickEnum(value, allowed, fallback) {
  const v = String(value || "").toLowerCase().trim();
  return allowed.includes(v) ? v : fallback;
}

function formatBulletSection(title, items) {
  if (!items.length) return "";
  return `${title}:\n${items.map((i) => `• ${i}`).join("\n")}`;
}

function buildDescription(summary, responsibilities) {
  const parts = [];
  if (summary?.trim()) parts.push(summary.trim());
  const resp = formatBulletSection("Responsibilities", responsibilities);
  if (resp) parts.push(resp);
  return parts.join("\n\n");
}

function buildRequirements(requirements, preferredQualifications) {
  const parts = [];
  const req = formatBulletSection("Requirements", requirements);
  const pref = formatBulletSection("Preferred qualifications", preferredQualifications);
  if (req) parts.push(req);
  if (pref) parts.push(pref);
  return parts.join("\n\n");
}

function normalizeAiResult(raw, { companyName, location }) {
  const responsibilities = asStringArray(raw.responsibilities, 8);
  const requirements = asStringArray(raw.requirements, 8);
  const preferredQualifications = asStringArray(raw.preferredQualifications, 5);
  const tags = asStringArray(raw.tags, 10);

  let salaryMin = Number.isFinite(Number(raw.salaryMin)) ? Number(raw.salaryMin) : null;
  let salaryMax = Number.isFinite(Number(raw.salaryMax)) ? Number(raw.salaryMax) : null;
  const salaryConfidence = Math.min(100, Math.max(0, Number(raw.salaryConfidence) || 0));

  const suggestedFields = new Set(
    Array.isArray(raw.suggestedFields)
      ? raw.suggestedFields.map((f) => String(f))
      : [],
  );

  if (salaryConfidence < SALARY_CONFIDENCE_THRESHOLD) {
    salaryMin = null;
    salaryMax = null;
    suggestedFields.add("salaryMin");
    suggestedFields.add("salaryMax");
  }

  const resolvedLocation = (raw.location || location || "").trim();
  const title = String(raw.title || "").trim().slice(0, 300);
  const baseSlug = raw.slug?.trim()
    ? slugify(raw.slug)
    : buildJobSlug(title, companyName || "company", resolvedLocation);

  const jobType = pickEnum(raw.jobType, JOB_TYPES, "full-time");
  const workMode = pickEnum(raw.workMode, WORK_MODES, "remote");

  return {
    title,
    summary: String(raw.summary || "").trim(),
    responsibilities,
    requirements,
    preferredQualifications,
    tags,
    jobCategory: String(raw.jobCategory || "").trim(),
    seniorityLevel: String(raw.seniorityLevel || "").trim(),
    jobType,
    workMode,
    salaryMin,
    salaryMax,
    salaryConfidence,
    location: resolvedLocation,
    slug: baseSlug.slice(0, 200),
    metaDescription: String(raw.metaDescription || "").trim().slice(0, 160),
    suggestedFields: [...suggestedFields],
    description: buildDescription(raw.summary, responsibilities),
    requirementsText: buildRequirements(requirements, preferredQualifications),
  };
}

async function generateJobPostingDraft({ input, companyName, location }) {
  if (!input?.trim() || input.trim().length < 3) {
    const err = new Error("Input must be at least 3 characters");
    err.statusCode = 400;
    throw err;
  }

  const userContent = [
    companyName ? `Company name (for slug context only, do not invent details): ${companyName}` : "",
    location ? `Location hint: ${location}` : "",
    "",
    "Employer input:",
    input.trim().slice(0, 12000),
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await chat({
    model: MODEL_FALLBACKS.generation,
    temperature: TEMPERATURE.GENERATION,
    useFallback: true,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  return normalizeAiResult(raw, { companyName, location });
}

module.exports = {
  generateJobPostingDraft,
  normalizeAiResult,
  SALARY_CONFIDENCE_THRESHOLD,
};
