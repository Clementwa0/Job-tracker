import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest, readJson, stringArray } from "@/lib/ai/route";

const PROMPTS: Record<string, string> = {
  title: "Rewrite the candidate's job title so it is concise, confident, and ATS-friendly. Preserve real experience. Return JSON: {\"variants\":[\"...\"]} with 3 distinct variants.",
  summary: "Rewrite the candidate's professional summary so it is concise (3-4 sentences), confident, and ATS-friendly. Preserve real experience. Return JSON: {\"variants\":[\"...\"]} with 3 distinct variants.",
  bullet: "Rewrite the resume bullet so it leads with a strong action verb, includes a measurable result when possible, and stays under 28 words. Return JSON: {\"variants\":[\"...\"]} with 3 distinct variants.",
  achievement: "Turn the input into 3 high-impact achievement bullets (action + scope + measurable outcome). Return JSON: {\"variants\":[\"...\"]}.",
  tailor: "Rewrite the resume bullet so it better matches the supplied job description while staying truthful. Return JSON: {\"variants\":[\"...\"]} with 3 variants.",
};

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request); if ("response" in access) return access.response;
  const body = await readJson(request); const { kind, text, context } = body || {};
  if (typeof kind !== "string" || !PROMPTS[kind]) return NextResponse.json({ error: "Unknown kind." }, { status: 400 });
  if (typeof text !== "string" || text.trim().length < 3) return NextResponse.json({ error: "Text is required." }, { status: 400 });
  try {
    const result = await chat({ model: MODEL_FALLBACKS.generation, temperature: TEMPERATURE.IMPROVEMENT, messages: [
      { role: "system", content: PROMPTS[kind] },
      { role: "user", content: typeof context === "string" ? `INPUT:\n${text.slice(0, 2000)}\n\nCONTEXT:\n${context.slice(0, 4000)}` : text.slice(0, 2000) },
    ] });
    return NextResponse.json({ variants: stringArray(result.variants) });
  } catch (error) { return aiFailure(error, "AI improve failed."); }
}
