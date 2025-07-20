const express = require("express");
const Groq = require("groq-sdk");
require('dotenv').config();
const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MAX_CHARS = 8000;

async function getGroqMarkdownReview(cvText) {
  const safeText = cvText.length > MAX_CHARS ? cvText.slice(0, MAX_CHARS) : cvText;

  return groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: `
You are a professional CV reviewer.  
Analyze the following CV text and return your feedback in **this exact markdown format**:

## ✅ Structure


---

## ✅ Impact & Experience
-
---

## ✅ Language


---

## ✅ ATS Readiness

---

## ✅ Suggested Roles


---

## ✅ Recommendations & Next Steps


---

## ✅ Example Bullet Point Rewrite


DO NOT add explanations or any extra text.  
Respond ONLY in this markdown format.
      `,
      },
      { role: "user", content: safeText },
    ],
  });
}

// Helper function to split markdown into sections
function parseMarkdownSections(markdown) {
  const sections = {
    structure: "",
    impact: "",
    language: "",
    ats: "",
    roles: "",
    recommendations: "",
    examples: "",
  };

  const regex = /## ✅ (.*?)\n\n([\s\S]*?)(?=\n---|\n$)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const key = match[1].toLowerCase().replace(/ &.*| /g, "");
    if (sections[key] !== undefined) {
      sections[key] = match[2].trim();
    }
  }
  return sections;
}

router.post("/", async (req, res) => {
  const { cvText } = req.body;
  if (!cvText) return res.status(400).json({ error: "No CV text provided" });

  try {
    const completion = await getGroqMarkdownReview(cvText);
    const markdown = completion.choices[0]?.message?.content || "";

    if (!markdown.startsWith("## ✅ Structure")) {
      console.error("Unexpected Groq output:", markdown);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const sections = parseMarkdownSections(markdown);
    res.json(sections);
  } catch (error) {
    console.error("Groq API error:", error.message || error);
    res.status(500).json({ error: "Error processing CV review" });
  }
});

module.exports = router;
