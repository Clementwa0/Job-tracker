import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest, readJson } from "@/lib/ai/route";

const fields = ["jobTitle", "companyName", "location", "jobType", "jobPostingUrl", "salaryRange", "applicationDeadline", "contactPerson", "contactEmail", "contactPhone", "notes"] as const;

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request); if ("response" in access) return access.response;
  const body = await readJson(request); const description = body?.description;
  if (typeof description !== "string" || !description.trim()) return NextResponse.json({ error: "Missing job description" }, { status: 400 });
  try {
    const result = await chat({ model: MODEL_FALLBACKS.extraction, temperature: TEMPERATURE.EXTRACTION, messages: [
      { role: "system", content: `You are a job extraction AI. Return ONLY valid JSON with exactly these string fields: ${fields.map((field) => `"${field}"`).join(", ")}. Use empty strings for information that is unavailable.` },
      { role: "user", content: description.slice(0, 12_000) },
    ] });
    return NextResponse.json(Object.fromEntries(fields.map((field) => [field, typeof result[field] === "string" ? result[field] : ""])));
  } catch (error) { return aiFailure(error, "Failed to analyze job description."); }
}
