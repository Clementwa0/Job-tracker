import { NextResponse } from "next/server";
import { chat, MODEL_FALLBACKS, TEMPERATURE } from "@/lib/ai/groq";
import { aiFailure, authorizeAiRequest, readJson, stringArray } from "@/lib/ai/route";

export async function POST(request: Request) {
  const access = await authorizeAiRequest(request); if ("response" in access) return access.response;
  const body = await readJson(request); const { bullet, context } = body || {};
  if (typeof bullet !== "string" || !bullet.trim()) return NextResponse.json({ error: "bullet required" }, { status: 400 });
  try {
    const result = await chat({ model: MODEL_FALLBACKS.generation, temperature: TEMPERATURE.IMPROVEMENT, messages: [
      { role: "system", content: "You rewrite resume bullet points using the XYZ formula (Action verb + measurable impact + context). Return ONLY JSON: { \"variants\": [\"v1\",\"v2\",\"v3\"] }." },
      { role: "user", content: `Bullet: ${bullet.slice(0, 2000)}\nContext: ${typeof context === "string" ? context.slice(0, 4000) : "n/a"}` },
    ] });
    return NextResponse.json({ variants: stringArray(result.variants) });
  } catch (error) { return aiFailure(error, "Rewrite failed."); }
}
