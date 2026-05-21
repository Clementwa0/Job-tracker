const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");

const models = [
  "groq/compound-mini",
    "groq/llama-3.1-70b-versatile",
  "groq/llama-3.2-90b-vision-preview"
];

router.get("/", async (req, res) => {
  try {
    let result = null;
    let usedModel = null;

    for (const model of models) {
      try {
        result = await chat({
          model,
          temperature: 0.7,
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

        usedModel = model;
        break;
      } catch (err) {
        console.error(`Model failed: ${model}`);
      }
    }

    if (!result) {
      return res.status(500).json({
        success: false,
        title: "Error",
        description: "Failed to generate a career tip.",
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
      model: usedModel,
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