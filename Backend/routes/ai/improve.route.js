const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");
const { MODEL_FALLBACKS, TEMPERATURE } = require("./models.config");

const PROMPTS = {
  title: `Rewrite the candidate's job title so it is concise, confident, and ATS-friendly. Preserve the candidate's real experience. Return JSON: {"variants": ["..."]} with 3 distinct variants.`,
  summary: `Rewrite the candidate's professional summary so it is concise (3-4 sentences), confident, and ATS-friendly. Preserve the candidate's real experience. Return JSON: {"variants": ["..."]} with 3 distinct variants.`,
  bullet: `Rewrite the resume bullet so it leads with a strong action verb, includes a measurable result when possible, and stays under 28 words. Return JSON: {"variants": ["..."]} with 3 distinct variants.`,
  achievement: `Turn the input into 3 high-impact achievement bullets (action + scope + measurable outcome). Return JSON: {"variants": ["..."]}.`,
  tailor: `Rewrite the resume bullet so it better matches the supplied job description while staying truthful. Return JSON: {"variants": ["..."]} with 3 variants.`,
};

router.post("/", async (req, res) => {
  try {
    const { kind, text, context } = req.body || {};
    const prompt = PROMPTS[kind];
    if (!prompt) return res.status(400).json({ error: "Unknown kind." });
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return res.status(400).json({ error: "Text is required." });
    }

    const user = context
      ? `INPUT:\n${text.slice(0, 2000)}\n\nCONTEXT:\n${String(context).slice(0, 4000)}`
      : text.slice(0, 2000);

    const result = await chat({
      model: MODEL_FALLBACKS.generation,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: user },
      ],
      temperature: TEMPERATURE.IMPROVEMENT,
      useFallback: true,
    });

    const variants = Array.isArray(result?.variants)
      ? result.variants.filter((v) => typeof v === "string").slice(0, 5)
      : [];
    return res.json({ variants });
  } catch (err) {
    console.error("[ai/improve] failed:", err?.message || err);
    return res.status(500).json({ error: "AI improve failed." });
  }
});

module.exports = router;