import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest, readJson, stringArray } from "@/lib/ai/route";

const MIN = 80;
const MAX = 18_000;

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request); if ("response" in access) return access.response;
  const body = await readJson(request); const text = body?.text;
  if (typeof text !== "string" || text.length < MIN) return NextResponse.json({ error: `Resume text must be at least ${MIN} characters.` }, { status: 400 });
  const clean = text.replace(/```/g, "").replace(/system:|assistant:|user:/gi, "").slice(0, MAX);
  try {
    const result = await chat({ model: MODEL_FALLBACKS.parsing, temperature: TEMPERATURE.PARSING, messages: [
      { role: "system", content: `You are a resume parser. Convert raw resume text into strict JSON of shape: {"confidence":0.0,"warnings":[],"resume":{"contact":{"fullName":"","title":"","email":"","phone":"","location":"","website":"","linkedin":"","github":""},"summary":"","experience":[{"company":"","role":"","location":"","startDate":"YYYY-MM","endDate":"YYYY-MM","current":false,"bullets":[""]}],"education":[{"school":"","degree":"","field":"","startDate":"YYYY-MM","endDate":"YYYY-MM","notes":""}],"projects":[{"name":"","url":"","description":"","tech":[]}],"skills":[{"category":"","items":[]}],"certifications":[{"name":"","issuer":"","date":"YYYY-MM","url":""}],"languages":[{"name":"","level":""}]}}. Output ONLY valid JSON. Use empty strings/arrays when info is missing; never null. Dates must be YYYY-MM; use YYYY-01 for year only. Group skills sensibly and list uncertain fields in warnings.` },
      { role: "user", content: clean },
    ] });
    const resume = result.resume && typeof result.resume === "object" && !Array.isArray(result.resume) ? result.resume as Record<string, unknown> : {};
    const contact = resume.contact && typeof resume.contact === "object" && !Array.isArray(resume.contact) ? resume.contact as Record<string, unknown> : {};
    return NextResponse.json({
      confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0.5)), warnings: stringArray(result.warnings, 20),
      resume: {
        contact: { fullName: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", ...contact },
        summary: typeof resume.summary === "string" ? resume.summary : "",
        experience: Array.isArray(resume.experience) ? resume.experience : [], education: Array.isArray(resume.education) ? resume.education : [],
        projects: Array.isArray(resume.projects) ? resume.projects : [], skills: Array.isArray(resume.skills) ? resume.skills : [],
        certifications: Array.isArray(resume.certifications) ? resume.certifications : [], languages: Array.isArray(resume.languages) ? resume.languages : [],
      },
    });
  } catch (error) { return aiFailure(error, "Failed to parse resume."); }
}
