const express = require("express");
const router = express.Router();
const { chat } = require("./groq.service");
const { MODEL_FALLBACKS, TEMPERATURE } = require("./models.config");

const MIN = 80;
const MAX = 18000;

router.post("/", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || text.length < MIN) {
      return res.status(400).json({ error: `Resume text must be at least ${MIN} characters.` });
    }

    const clean = String(text)
      .replace(/```/g, "")
      .replace(/system:|assistant:|user:/gi, "")
      .slice(0, MAX);

    const systemPrompt = `
You are a resume parser. Convert the raw resume text into strict JSON of shape:
{
  "confidence": 0.0,
  "warnings": [],
  "resume": {
    "contact": {
      "fullName": "", "title": "", "email": "", "phone": "",
      "location": "", "website": "", "linkedin": "", "github": ""
    },
    "summary": "",
    "experience": [
      { "company": "", "role": "", "location": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "current": false, "bullets": [""] }
    ],
    "education": [
      { "school": "", "degree": "", "field": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "notes": "" }
    ],
    "projects": [
      { "name": "", "url": "", "description": "", "tech": [] }
    ],
    "skills": [
      { "category": "", "items": [] }
    ],
    "certifications": [
      { "name": "", "issuer": "", "date": "YYYY-MM", "url": "" }
    ],
    "languages": [
      { "name": "", "level": "" }
    ]
  }
}

Rules:
- Output ONLY valid JSON (no prose, no markdown).
- Use empty strings/arrays when info is missing — never null.
- Dates must be YYYY-MM. If only a year is present, use YYYY-01.
- Group skills by sensible categories (e.g. "Languages", "Frameworks", "Tools").
- 'confidence' reflects parsing quality 0..1.
- 'warnings' lists fields you could not confidently extract.`.trim();

    const result = await chat({
      model: MODEL_FALLBACKS.parsing,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: clean },
      ],
      temperature: TEMPERATURE.PARSING,
      useFallback: true,
    });

    const r = (result && result.resume) || {};
    const normalized = {
      confidence: Math.max(0, Math.min(1, Number(result?.confidence) || 0.5)),
      warnings: Array.isArray(result?.warnings) ? result.warnings.slice(0, 20) : [],
      resume: {
        contact: { fullName: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", ...(r.contact || {}) },
        summary: typeof r.summary === "string" ? r.summary : "",
        experience: Array.isArray(r.experience) ? r.experience : [],
        education: Array.isArray(r.education) ? r.education : [],
        projects: Array.isArray(r.projects) ? r.projects : [],
        skills: Array.isArray(r.skills) ? r.skills : [],
        certifications: Array.isArray(r.certifications) ? r.certifications : [],
        languages: Array.isArray(r.languages) ? r.languages : [],
      },
    };

    return res.json(normalized);
  } catch (err) {
    console.error("[ai/parse] failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to parse resume." });
  }
});

module.exports = router;