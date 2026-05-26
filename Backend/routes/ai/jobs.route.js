const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");
const { MODEL_FALLBACKS, TEMPERATURE } = require("./models.config");

router.post("/", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Missing job description" });
    }

    const result = await chat({
      model: MODEL_FALLBACKS.extraction,
      temperature: TEMPERATURE.EXTRACTION,
      useFallback: true,
      messages: [
        {
          role: "system",
          content: `
You are a job extraction AI.

Return ONLY valid JSON:

{
  "jobTitle": "",
  "companyName": "",
  "location": "",
  "jobType": "",
  "jobPostingUrl": "",
  "salaryRange": "",
  "applicationDeadline": "",
  "contactPerson": "",
  "contactEmail": "",
  "contactPhone": "",
  "notes": ""
}
          `.trim(),
        },
        {
          role: "user",
          content: description,
        },
      ],
    });

    return res.json(result);
  } catch (err) {
    console.error("Job extract error:", err);
    return res.status(500).json({
      error: "Failed to analyze job description",
    });
  }
});

module.exports = router;