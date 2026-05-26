const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");
const auth = require("../../middleware/auth");
const { MODEL_FALLBACKS, TEMPERATURE } = require("./models.config");

router.post("/match", auth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body || {};
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "resumeText and jobDescription are required" });
    }

    const result = await chat({
      model: MODEL_FALLBACKS.matching,
      temperature: TEMPERATURE.MATCHING,
      useFallback: true,
      messages: [
        {
          role: "system",
          content: `You are an ATS resume<>job-description matcher.
Return ONLY JSON of shape:
{
  "matchScore": 0,
  "summary": "",
  "strengths": [],
  "gaps": [],
  "keywords": { "matched": [], "missing": [] },
  "suggestions": []
}
The matchScore is 0-100. Be specific and actionable.`,
        },
        {
          role: "user",
          content: `RESUME:\n${String(resumeText).slice(0, 8000)}\n\nJOB DESCRIPTION:\n${String(jobDescription).slice(0, 6000)}`,
        },
      ],
    });

    result.matchScore = Math.max(0, Math.min(100, Number(result.matchScore) || 0));
    res.json(result);
  } catch (err) {
    console.error("match error:", err);
    res.status(500).json({ error: "Match analysis failed" });
  }
});

router.post("/rewrite", auth, async (req, res) => {
  try {
    const { bullet, context } = req.body || {};
    if (!bullet) return res.status(400).json({ error: "bullet required" });

    const result = await chat({
      model: MODEL_FALLBACKS.generation,
      temperature: TEMPERATURE.IMPROVEMENT,
      useFallback: true,
      messages: [
        {
          role: "system",
          content: `You rewrite resume bullet points using the XYZ formula
(Action verb + measurable impact + context).
Return ONLY JSON: { "variants": ["v1","v2","v3"] }.`,
        },
        {
          role: "user",
          content: `Bullet: ${bullet}\nContext: ${context || "n/a"}`,
        },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error("rewrite error:", err);
    res.status(500).json({ error: "Rewrite failed" });
  }
});

module.exports = router;