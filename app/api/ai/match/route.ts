import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest, readJson, stringArray } from "@/lib/ai/route";

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request);
  if ("response" in access) return access.response;
  const body = await readJson(request);
  const { resumeText, jobDescription } = body || {};
  if (typeof resumeText !== "string" || typeof jobDescription !== "string" || !resumeText.trim() || !jobDescription.trim()) {
    return NextResponse.json({ error: "resumeText and jobDescription are required" }, { status: 400 });
  }

  try {
    const result = await chat({
      model: MODEL_FALLBACKS.matching,
      temperature: TEMPERATURE.MATCHING,
      messages: [
        { role: "system", content: `You are an ATS resume<>job-description matcher. Return ONLY JSON of shape: {"matchScore":0,"summary":"","strengths":[],"gaps":[],"keywords":{"matched":[],"missing":[]},"suggestions":[]}. The matchScore is 0-100. Be specific and actionable.` },
        { role: "user", content: `RESUME:\n${resumeText.slice(0, 8000)}\n\nJOB DESCRIPTION:\n${jobDescription.slice(0, 6000)}` },
      ],
    });
    const keywords = result.keywords && typeof result.keywords === "object" && !Array.isArray(result.keywords) ? result.keywords as Record<string, unknown> : {};
    return NextResponse.json({
      matchScore: Math.max(0, Math.min(100, Number(result.matchScore) || 0)),
      summary: typeof result.summary === "string" ? result.summary : "",
      strengths: stringArray(result.strengths), gaps: stringArray(result.gaps),
      keywords: { matched: stringArray(keywords.matched), missing: stringArray(keywords.missing) },
      suggestions: stringArray(result.suggestions),
    });
  } catch (error) { return aiFailure(error, "Match analysis failed."); }
}
