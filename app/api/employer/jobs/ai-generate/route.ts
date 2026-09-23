import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, readJson, stringArray } from "@/lib/ai/route";
import { requireActiveAccount } from "@/lib/auth/requireActiveAccount";
import { JOB_TYPES, WORK_MODES } from "@/lib/jobPostings/options";

const SYSTEM_PROMPT = `You create complete, professional job postings from an employer's brief.
Return only valid JSON with this exact shape:
{
  "companyName": "",
  "title": "",
  "category": "",
  "summary": "",
  "responsibilities": [""],
  "requirements": [""],
  "preferredQualifications": [""],
  "tags": [""],
  "jobCategory": "",
  "seniorityLevel": "",
  "jobType": "full-time|part-time|contract|internship",
  "workMode": "onsite|remote|hybrid",
  "experienceLevel": "Entry-level|Mid-level|Senior|Lead / Principal|Executive",
  "educationLevel": "Not required|High school|Associate degree|Bachelor's degree|Master's degree|Doctorate",
  "salaryMin": null,
  "salaryMax": null,
  "salaryConfidence": 0,
  "location": "",
  "slug": "",
  "metaDescription": "",
  "suggestedFields": ["title"],
  "description": "",
  "requirementsText": "",
  "applicationDeadline": "YYYY-MM-DD",
  "applicationMethod": "external_link|email|whatsapp",
  "applicationUrl": ""
}
Extract the company name when it appears in the brief or job description; otherwise use an empty string. Use empty strings, empty arrays, or null when information is unavailable. Never invent a salary. Keep description and requirementsText ready to paste into a job form. salaryConfidence must be an integer from 0 to 100.`;

const JOB_TYPE_VALUES = new Set(JOB_TYPES.map(([value]) => value));
const WORK_MODE_VALUES = new Set(WORK_MODES.map(([value]) => value));
const APPLICATION_METHODS = new Set(["external_link", "email", "whatsapp"]);

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== null && value !== "" ? parsed : null;
}

export async function POST(request: Request) {
  const auth = await requireActiveAccount(request, ["employer"]);
  if (!auth.ok) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });

  const body = await readJson(request);
  const input = text(body?.input);
  const location = text(body?.location);
  if (input.length < 3) {
    return NextResponse.json({ success: false, message: "A job title or description is required." }, { status: 400 });
  }

  try {
    const result = await chat({
      model: MODEL_FALLBACKS.generation,
      temperature: TEMPERATURE.GENERATION,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `JOB BRIEF:\n${input.slice(0, 12000)}${location ? `\n\nLOCATION HINT:\n${location.slice(0, 200)}` : ""}` },
      ],
    });

    const jobType = text(result.jobType).toLowerCase();
    const workMode = text(result.workMode).toLowerCase();
    const experienceLevel = text(result.experienceLevel);
    const educationLevel = text(result.educationLevel);
    const applicationMethod = text(result.applicationMethod).toLowerCase();
    const applicationDeadline = /^\d{4}-\d{2}-\d{2}$/.test(text(result.applicationDeadline))
      ? text(result.applicationDeadline)
      : "";
    const salaryConfidence = Math.max(0, Math.min(100, Math.round(Number(result.salaryConfidence) || 0)));
    const responsibilities = stringArray(result.responsibilities, 12);
    const requirements = stringArray(result.requirements, 12);
    const summary = text(result.summary);
    const normalized = {
      companyName: text(result.companyName),
      title: text(result.title),
      category: text(result.category) || text(result.jobCategory),
      summary,
      responsibilities,
      requirements,
      preferredQualifications: stringArray(result.preferredQualifications, 12),
      tags: stringArray(result.tags, 15),
      jobCategory: text(result.jobCategory),
      seniorityLevel: text(result.seniorityLevel),
      jobType: JOB_TYPE_VALUES.has(jobType) ? jobType : "full-time",
      workMode: WORK_MODE_VALUES.has(workMode) ? workMode : "onsite",
      experienceLevel,
      educationLevel,
      salaryMin: numberOrNull(result.salaryMin),
      salaryMax: numberOrNull(result.salaryMax),
      salaryConfidence,
      location: text(result.location) || location,
      slug: text(result.slug),
      metaDescription: text(result.metaDescription),
      suggestedFields: stringArray(result.suggestedFields, 20),
      description: text(result.description) || [summary, ...responsibilities.map((item) => `- ${item}`)].filter(Boolean).join("\n\n"),
      requirementsText: text(result.requirementsText) || requirements.map((item) => `- ${item}`).join("\n"),
      applicationDeadline,
      applicationMethod: APPLICATION_METHODS.has(applicationMethod) ? applicationMethod as "external_link" | "email" | "whatsapp" : "external_link",
      applicationUrl: text(result.applicationUrl),
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    return aiFailure(error, "Job posting AI generation failed.");
  }
}