import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest } from "@/lib/ai/route";

const CATEGORIES = new Set(["interview", "CV", "networking", "application", "career growth"]);

export async function GET(request: Request) {
  const access = await authorizeAiRequest(request); if ("response" in access) return access.response;
  try {
    const result = await chat({ model: MODEL_FALLBACKS.generation, temperature: TEMPERATURE.TIPS, messages: [
      { role: "system", content: "You are a senior career coach. Return ONLY valid JSON: {\"title\":\"short catchy title (max 6 words)\",\"description\":\"one clear practical job application tip (1 sentence)\",\"category\":\"interview | CV | networking | application | career growth\"}." },
      { role: "user", content: "Give me a unique job application tip." },
    ] });
    const category = typeof result.category === "string" && CATEGORIES.has(result.category) ? result.category : "application";
    return NextResponse.json({ success: true, title: typeof result.title === "string" ? result.title.slice(0, 120) : "Application tip", description: typeof result.description === "string" ? result.description : "Tailor each application to the role's most important requirements.", category, model: "groq" });
  } catch (error) { return aiFailure(error, "Server error generating tip."); }
}
