const express = require("express");
const router = express.Router();

const { chat } = require("./groq.service");

const MIN_CV_LENGTH = 50;
const MAX_CV_LENGTH = 12000;

const MODELS = [
  "groq/llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "groq/mixtral-8x7b-32768",
  "groq/llama-3.1-8b-instant",
];

const SYSTEM_PROMPT = `
You are an ATS CV reviewer.

Analyze the CV professionally.

IMPORTANT:
- Return ONLY valid JSON
- No markdown
- No explanations
- No code blocks
- ats_score must be between 0 and 100
- recommended_jobs must be an array

JSON Schema:
{
  "formatting_and_structure": "",
  "grammar_and_clarity": "",
  "skills_match": "",
  "achievements_and_impact": "",
  "ats_compatibility": "",
  "ats_score": 0,
  "recommended_jobs": []
}
`.trim();

/**
 * Randomize model usage
 */
function getRandomizedModels() {
  return [...MODELS].sort(() => Math.random() - 0.5);
}

/**
 * Sanitize CV input
 */
function sanitize(text = "") {
  return text
    .replace(/system:|assistant:|user:/gi, "")
    .replace(/```/g, "")
    .replace(/\0/g, "")
    .trim()
    .slice(0, MAX_CV_LENGTH);
}

/**
 * Normalize AI response
 */
function normalizeResponse(data = {}) {
  return {
    formatting_and_structure:
      typeof data.formatting_and_structure === "string"
        ? data.formatting_and_structure
        : "",

    grammar_and_clarity:
      typeof data.grammar_and_clarity === "string"
        ? data.grammar_and_clarity
        : "",

    skills_match:
      typeof data.skills_match === "string"
        ? data.skills_match
        : "",

    achievements_and_impact:
      typeof data.achievements_and_impact === "string"
        ? data.achievements_and_impact
        : "",

    ats_compatibility:
      typeof data.ats_compatibility === "string"
        ? data.ats_compatibility
        : "",

    recommended_jobs: Array.isArray(data.recommended_jobs)
      ? data.recommended_jobs
      : [],

    ats_score: Number.isFinite(Number(data.ats_score))
      ? Math.max(0, Math.min(100, Number(data.ats_score)))
      : 0,
  };
}

/**
 * Safe JSON parsing
 */
function safeParse(input) {
  try {
    if (!input) return null;

    // already object
    if (typeof input === "object") {
      return input;
    }

    // remove markdown if model adds it
    const cleaned = input
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/**
 * Generate ATS Review
 */
async function generateATSReview(cleanCV) {
  let lastError = null;

  const modelsToTry = getRandomizedModels();

  for (const model of modelsToTry) {
    try {
      console.log(`🚀 Trying model: ${model}`);

      const response = await chat({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: cleanCV,
          },
        ],
      });

      if (!response) {
        throw new Error("Empty AI response");
      }

      const parsed = safeParse(response);

      if (!parsed) {
        throw new Error("Invalid JSON response");
      }

      console.log(`✅ Success with model: ${model}`);

      return normalizeResponse(parsed);

    } catch (error) {
      lastError = error;

      console.error(`❌ Model failed: ${model}`);
      console.error(error.message);

      // skip rate-limited model immediately
      if (error.status === 429) {
        continue;
      }
    }
  }

  throw lastError || new Error("All models failed");
}

/**
 * POST /api/review
 */
router.post("/", async (req, res) => {
  try {
    const cvText = req.body?.cvText;

    // validate input
    if (!cvText || typeof cvText !== "string") {
      return res.status(400).json({
        success: false,
        error: "CV text is required",
      });
    }

    if (cvText.trim().length < MIN_CV_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `CV must be at least ${MIN_CV_LENGTH} characters`,
      });
    }

    // sanitize input
    const cleanCV = sanitize(cvText);

    // generate ATS analysis
    const result = await generateATSReview(cleanCV);

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ CV Review Error:");
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message || "CV review failed",
    });
  }
});

module.exports = router;
