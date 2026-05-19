const { Groq } = require("groq-sdk");
require("dotenv").config();

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const models = [
    
    "qwen/qwen3-32b",
  ];

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.7,
        max_tokens: 250,
        response_format: { type: "json_object" }, // ✅ IMPORTANT
        messages: [
          {
            role: "system",
            content: `
You are a senior career coach.

Return ONLY valid JSON in this format:

{
  "title": "short catchy title (max 6 words)",
  "description": "one clear practical job application tip (1 sentence)",
  "category": "interview | CV | networking | application | career growth"
}

Rules:
- No markdown
- No extra text
- No explanations
- Always return valid JSON
            `.trim(),
          },
          {
            role: "user",
            content: "Give me a unique job application tip.",
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        throw new Error("Invalid JSON from model");
      }

      return res.status(200).json({
        success: true,
        ...parsed,
        model,
      });
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
    }
  }

  return res.status(500).json({
    success: false,
    title: "Error",
    description: "Failed to generate a career tip. Try again later.",
  });
};
