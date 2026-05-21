const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");

const MIN_CV_LENGTH = 50;
const MAX_CV_LENGTH = 12000;

const models = [
  "groq/compound-mini",
  "groq/compound-mini"
];

function sanitize(text) {
  return text
    .replace(/system:|assistant:|user:/gi, "")
    .replace(/```/g, "")
    .slice(0, MAX_CV_LENGTH);
}

router.post("/", async (req, res) => {
  try {
    const { cvText } = req.body;

    if (!cvText || cvText.length < MIN_CV_LENGTH) {
      return res.status(400).json({
        error: `CV must be at least ${MIN_CV_LENGTH} characters`,
      });
    }

    const clean = sanitize(cvText);

    let result = null;

    for (const model of models) {
      try {
        result = await chat({
          model,
          messages: [
            {
              role: "system",
              content: `
You are an ATS CV reviewer.

Return ONLY JSON:
{
  "formatting_and_structure": "",
  "grammar_and_clarity": "",
  "skills_match": "",
  "achievements_and_impact": "",
  "ats_compatibility": "",
  "ats_score": 0,
  "recommended_jobs": ""
}
              `.trim(),
            },
            {
              role: "user",
              content: clean,
            },
          ],
        });

        break;
      } catch (e) {
        console.error("Model failed:", model);
      }
    }

    if (!result) {
      return res.status(500).json({ error: "All models failed" });
    }

    // normalize score
    result.ats_score = Math.max(
      0,
      Math.min(100, Number(result.ats_score) || 70)
    );

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "CV review failed" });
  }
});

module.exports = router;