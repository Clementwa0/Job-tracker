const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");
const { MODEL_FALLBACKS, TEMPERATURE } = require("./models.config");

router.get("/", async (req, res) => {
  try {
    const result = await chat({
      model: MODEL_FALLBACKS.generation,
      temperature: TEMPERATURE.TIPS,
      useFallback: true,
      messages: [
        {
          role: "system",
          content: `
You are a senior career coach.

Return ONLY valid JSON:

{
  "title": "short catchy title (max 6 words)",
  "description": "one clear practical job application tip (1 sentence)",
  "category": "interview | CV | networking | application | career growth"
}
          `.trim(),
        },
        {
          role: "user",
          content: "Give me a unique job application tip.",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      ...result,
      model: "groq/llama-3.1-70b-versatile",
    });

  } catch (err) {
    console.error("Tips error:", err);
    return res.status(500).json({
      success: false,
      title: "Error",
      description: "Server error generating tip.",
    });
  }
});

module.exports = router;