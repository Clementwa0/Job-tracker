import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, readJson, stringArray } from "@/lib/ai/route";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import {
  JOB_CATEGORIES,
  JOB_TYPES,
  WORK_MODES,
} from "@/lib/jobPostings/options";

type JobType = "full-time" | "part-time" | "contract" | "internship";

type WorkMode = "onsite" | "remote" | "hybrid";

type ApplicationMethod = "external_link" | "email" | "whatsapp";

const CATEGORY_LIST = JOB_CATEGORIES.join(", ");

const JOB_TYPE_LIST = JOB_TYPES.map(([value]) => value).join(", ");

const WORK_MODE_LIST = WORK_MODES.map(([value]) => value).join(", ");

const JOB_TYPE_VALUES = new Set<string>(JOB_TYPES.map(([value]) => value));

const WORK_MODE_VALUES = new Set<string>(WORK_MODES.map(([value]) => value));

const CATEGORY_VALUES = new Set<string>(JOB_CATEGORIES);

const APPLICATION_METHODS = new Set<string>([
  "external_link",
  "email",
  "whatsapp",
]);

function isJobType(value: string): value is JobType {
  return JOB_TYPE_VALUES.has(value);
}

function isWorkMode(value: string): value is WorkMode {
  return WORK_MODE_VALUES.has(value);
}

function isApplicationMethod(value: string): value is ApplicationMethod {
  return APPLICATION_METHODS.has(value);
}

const SYSTEM_PROMPT = `
You are a strict job-posting information extraction engine.

Your task is to extract structured job information from the supplied job
posting or job brief.

IMPORTANT EXTRACTION RULES:

1. Extract information from the supplied source only.
2. Do NOT invent missing information.
3. Do NOT create qualifications, responsibilities, salaries, benefits,
   deadlines, URLs, emails, or locations that are not present in the source.
4. Preserve important source wording and details.
5. Do not replace specific source information with generic classifications.
6. Do not confuse the posting date with the application deadline.
7. If the source says that a deadline is not specified, return null.
8. If an application URL/email is not present, return an empty string.
9. If a field is not present, return an empty string, empty array, or null.
10. Extract ALL meaningful responsibilities instead of summarizing them.
11. Extract ALL meaningful requirements and qualifications.
12. Keep multiple locations when the source lists multiple locations.
13. Preserve the actual experience wording from the source.
14. Preserve the actual education/qualification wording from the source.
15. Do not turn specific source information into a generic level unless
    the source itself uses that level.
16. Do not use the posting/publication date as the application deadline.
17. Do not infer an application URL from a website name or job-board URL.
18. Return only information supported by the supplied source.

RETURN ONLY VALID JSON.

The JSON must have exactly this structure:

{
  "companyName": "",
  "title": "",
  "category": "",
  "summary": "",
  "responsibilities": [],
  "requirements": [],
  "preferredQualifications": [],
  "tags": [],
  "certifications": "",
  "jobCategory": "",
  "seniorityLevel": "",
  "jobType": "",
  "workMode": "",
  "experienceLevel": "",
  "educationLevel": "",
  "salaryMin": null,
  "salaryMax": null,
  "salaryConfidence": 0,
  "location": "",
  "slug": "",
  "metaDescription": "",
  "suggestedFields": [],
  "description": "",
  "requirementsText": "",
  "applicationDeadline": null,
  "applicationMethod": "",
  "applicationUrl": ""
}

FIELD EXTRACTION RULES:

companyName:
Extract the employer/company name explicitly stated in the source.
If unavailable, return "".

title:
Extract the exact job title.
Do not rewrite it.

category:
Map the job to exactly one category from the supplied application
category list.

Only use a category from this list:

${CATEGORY_LIST}

Do not invent a new category.

summary:
Extract the job purpose, overview, objective, or role summary when
explicitly provided.

Do not invent a summary.

description:
Use the source's Job Purpose, Job Description, Overview, About the Role,
or equivalent description section.

Do NOT put the entire job posting into description.

Do NOT put the responsibilities list into description unless the source
does not provide a separate description/purpose section.

responsibilities:
Extract each responsibility as a separate array item.

Look for sections such as:
- Responsibilities
- Key Responsibilities
- Duties
- What You Will Do
- Role Responsibilities
- Job Duties

Preserve the actual responsibilities from the source.

requirements:
Extract each explicit qualification or requirement as a separate
array item.

Look for:
- Minimum Qualifications
- Qualifications
- Requirements
- Candidate Requirements
- Education and Experience
- Skills and Experience

preferredQualifications:
Only include qualifications explicitly described as:
- preferred
- desirable
- an added advantage
- advantage
- preferred qualification

Do not invent preferred qualifications.

tags:
Extract useful technical skills, technologies, tools, professional
skills, certifications, equipment, platforms, and domain keywords
explicitly present in the source.

Do not add generic tags that are not supported by the source.

certifications:
Extract explicit certifications mentioned in the source.

This includes:
- Required certifications
- Preferred certifications
- Certifications that are an added advantage
- Professional certificates
- Licenses
- Other explicitly required credentials

Do not invent certifications.

If multiple certifications are present, combine them into one concise
string separated by semicolons.

jobType:
Normalize only when the source clearly provides the employment type.

Allowed values:

${JOB_TYPE_LIST}

Examples:
"Full Time" -> "full-time"
"Part Time" -> "part-time"

If unavailable, return "".

workMode:
Normalize only when clearly stated.

Allowed values:

${WORK_MODE_LIST}

Examples:
"Onsite" -> "onsite"
"On-site" -> "onsite"
"Remote" -> "remote"
"Hybrid" -> "hybrid"

If unavailable, return "".

experienceLevel:
Preserve the actual experience requirement from the source.

Examples:
"1–5 years" -> "1–5 years"
"1 - 5 years" -> "1 - 5 years"
"At least 3 years" -> "At least 3 years"
"2 years of experience" -> "2 years of experience"

DO NOT convert:
"1–5 years"
into:
"Mid-level"

DO NOT invent an experience level when the source does not provide one.

educationLevel:
Preserve the actual education/qualification wording from the source.

Examples:
"BA/BSc/HND, Diploma, Vocational"

must remain:

"BA/BSc/HND, Diploma, Vocational"

Do NOT convert this into only:
"Bachelor's degree"

Do NOT invent an education level.

salaryMin:
Extract the numeric minimum salary.

Example:
"KSh 16,000 - KSh 30,000/month"
=> 16000

salaryMax:
Extract the numeric maximum salary.

Example:
"KSh 16,000 - KSh 30,000/month"
=> 30000

salaryConfidence:
Return an integer from 0 to 100 based only on how explicitly the salary
is stated.

If no salary is present:
0

location:
Extract every explicitly stated job location.

If the source lists:
"Bungoma, Eldoret, Kisii, Migori, Nakuru"

preserve all locations:

"Bungoma, Eldoret, Kisii, Migori, Nakuru"

Do not choose only one location.

If a location hint is supplied separately, use it only when the job source
does not contain a location.

applicationDeadline:
Extract ONLY an actual application deadline.

Examples:

"Deadline: 30 September 2026"
=> "2026-09-30"

"Application closes on October 5, 2026"
=> "2026-10-05"

If the source says:
"Deadline: Not specified"

return:
null

If no deadline is provided:
null

NEVER use the posting date as the application deadline.

applicationMethod:
Only return:
- "external_link"
- "email"
- "whatsapp"
- ""

Use "" when no application method is explicitly available.

applicationUrl:
Return an actual URL explicitly present in the source.

Never invent a URL.

If only a job-board page is present and it is not explicitly the employer's
application URL, do not automatically use it as the employer application URL.

slug:
Create a URL-friendly slug from the title only.

metaDescription:
Create a short SEO description using only information supported by the
supplied source.

suggestedFields:
Return the field names for which the source contains useful extracted
information.

Do not mark unavailable fields as suggested.

Do not include fields simply because they have defaults.

FINAL RULE:

This is extraction, not creative writing.

When the source contains specific information, preserve that information.

When the source does not contain information, leave the field empty or null.

Never fill missing information with assumptions.
`;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCategory(value: unknown): string {
  const category = text(value);

  if (CATEGORY_VALUES.has(category)) {
    return category;
  }

  return "";
}

function buildSuggestedFields(
  result: Record<string, unknown>,
  normalized: {
    companyName: string;
    title: string;
    category: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    tags: string[];
    certifications: string;
    jobType: string;
    workMode: string;
    experienceLevel: string;
    educationLevel: string;
    salaryMin: number | null;
    salaryMax: number | null;
    location: string;
    applicationDeadline: string | null;
    applicationMethod: string;
    applicationUrl: string;
  },
): string[] {
  const fields: string[] = [];

  if (normalized.companyName) {
    fields.push("companyName");
  }

  if (normalized.title) {
    fields.push("title");
  }

  if (normalized.category) {
    fields.push("category");
  }

  if (normalized.description) {
    fields.push("description");
  }

  if (normalized.responsibilities.length > 0) {
    fields.push("responsibilities");
  }

  if (normalized.requirements.length > 0) {
    fields.push("requirements");
  }

  if (normalized.tags.length > 0) {
    fields.push("tags");
  }

  if (normalized.certifications) {
    fields.push("certifications");
  }

  if (normalized.jobType) {
    fields.push("jobType");
  }

  if (normalized.workMode) {
    fields.push("workMode");
  }

  if (normalized.experienceLevel) {
    fields.push("experienceLevel");
  }

  if (normalized.educationLevel) {
    fields.push("educationLevel");
  }

  if (normalized.salaryMin !== null) {
    fields.push("salaryMin");
  }

  if (normalized.salaryMax !== null) {
    fields.push("salaryMax");
  }

  if (normalized.location) {
    fields.push("location");
  }

  if (normalized.applicationDeadline) {
    fields.push("applicationDeadline");
  }

  if (normalized.applicationMethod) {
    fields.push("application");
  }

  if (normalized.applicationUrl) {
    fields.push("application");
  }

  // Keep only fields that are part of the AI assistant's
  // supported field list.
  const allowedFields = new Set([
    "companyName",
    "title",
    "category",
    "description",
    "responsibilities",
    "requirements",
    "tags",
    "jobType",
    "workMode",
    "experienceLevel",
    "educationLevel",
    "salaryMin",
    "salaryMax",
    "location",
    "applicationDeadline",
    "application",
    "certifications",
  ]);

  return fields.filter((field) => allowedFields.has(field));
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);

  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        message: auth.message,
      },
      {
        status: auth.status,
      },
    );
  }

  const body = await readJson(request);

  const input = text(body?.input);
  const location = text(body?.location);

  if (input.length < 3) {
    return NextResponse.json(
      {
        success: false,
        message: "A job title or description is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await chat({
      model: MODEL_FALLBACKS.generation,
      temperature: TEMPERATURE.GENERATION,

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },

        {
          role: "user",
          content:
            `JOB SOURCE:\n${input.slice(0, 12000)}` +
            (location ? `\n\nLOCATION HINT:\n${location.slice(0, 200)}` : ""),
        },
      ],
    });

    const jobType = text(result.jobType).toLowerCase();

    const workMode = text(result.workMode).toLowerCase();

    const applicationMethod = text(result.applicationMethod).toLowerCase();

    const rawDeadline = text(result.applicationDeadline);

    const applicationDeadline = /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline)
      ? rawDeadline
      : null;

    const salaryConfidence = Math.max(
      0,
      Math.min(100, Math.round(Number(result.salaryConfidence) || 0)),
    );

    const responsibilities = stringArray(result.responsibilities, 20);

    const requirements = stringArray(result.requirements, 20);

    const preferredQualifications = stringArray(
      result.preferredQualifications,
      20,
    );

    const tags = stringArray(result.tags, 30);

    const summary = text(result.summary);

    const description = text(result.description) || summary;

    const requirementsText =
      text(result.requirementsText) ||
      [...requirements, ...preferredQualifications]
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n");

    const companyName = text(result.companyName);

    const title = text(result.title);

    const category =
      normalizeCategory(result.category) ||
      normalizeCategory(result.jobCategory);

    const normalizedJobType = isJobType(jobType) ? jobType : "";

    const normalizedWorkMode = isWorkMode(workMode) ? workMode : "";

    const normalizedApplicationMethod = isApplicationMethod(applicationMethod)
      ? applicationMethod
      : "";

    const experienceLevel = text(result.experienceLevel);

    const educationLevel = text(result.educationLevel);

    const salaryMin = numberOrNull(result.salaryMin);

    const salaryMax = numberOrNull(result.salaryMax);

    const normalizedLocation = text(result.location) || location;

    const certifications = text(result.certifications);

    const applicationUrl = text(result.applicationUrl);

    const normalized: {
      companyName: string;
      title: string;
      category: string;
      summary: string;
      responsibilities: string[];
      requirements: string[];
      preferredQualifications: string[];
      tags: string[];
      certifications: string;
      jobCategory: string;
      seniorityLevel: string;
      jobType: JobType | "";
      workMode: WorkMode | "";
      experienceLevel: string;
      educationLevel: string;
      salaryMin: number | null;
      salaryMax: number | null;
      salaryConfidence: number;
      location: string;
      slug: string;
      metaDescription: string;
      suggestedFields: string[];
      description: string;
      requirementsText: string;
      applicationDeadline: string | null;
      applicationMethod: ApplicationMethod | "";
      applicationUrl: string;
    } = {
      companyName,

      title,

      category,

      summary,

      responsibilities,

      requirements,

      preferredQualifications,

      tags,

      certifications,

      jobCategory: text(result.jobCategory),

      seniorityLevel: text(result.seniorityLevel),

      jobType: normalizedJobType,

      workMode: normalizedWorkMode,

      experienceLevel,

      educationLevel,

      salaryMin,

      salaryMax,

      salaryConfidence,

      location: normalizedLocation,

      slug: text(result.slug),

      metaDescription: text(result.metaDescription),

      suggestedFields: [],

      description,

      requirementsText,

      applicationDeadline,

      applicationMethod: normalizedApplicationMethod,

      applicationUrl,
    };
    normalized.suggestedFields = buildSuggestedFields(
      result as Record<string, unknown>,
      normalized,
    );

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    return aiFailure(error, "Job posting AI generation failed.");
  }
}
