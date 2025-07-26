const { Groq } = require("groq-sdk");
require("dotenv").config();

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.6,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: "You are a career coach. Respond with a single helpful job application tip. Format it as: Title: <short title>. Description: <1 sentence tip>.",
        },
        {
          role: "user",
          content: "Give me a unique job application tip everytime.",
        },
      ],
    });

    const content = completion.choices[0]?.message?.content || "";
    const [_, title, description] = content.match(/Title:\s*(.+)\nDescription:\s*(.+)/s) || [];

    res.status(200).json({ title: title || "AI Tip", description: description || content });
  } catch (err) {
    console.error("Tip fetch error:", err);
    res.status(500).json({ title: "Error", description: "Failed to generate tip." });
  }
};
