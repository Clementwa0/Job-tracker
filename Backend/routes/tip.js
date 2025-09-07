const { Groq } = require("groq-sdk");
require("dotenv").config();

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method Not Allowed");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Define primary + fallback models
  const models = ["openai/gpt-oss-120b", "llama-3.1-8b-instant"];

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.6,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "You are a career coach. Respond with a single helpful job application tip. Format it as: Title: <short title>. Description: <1 sentence tip>.",
          },
          {
            role: "user",
            content: "Give me a unique job application tip everytime.",
          },
        ],
      });

      const content = completion.choices[0]?.message?.content || "";
      const [_, title, description] =
        content.match(/Title:\s*(.+)\nDescription:\s*(.+)/s) || [];

      return res.status(200).json({
        title: title || "AI Tip",
        description: description || content,
        model,
      });
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
      // continue to next model in fallback list
    }
  }

  // If all models fail
  return res.status(500).json({
    title: "Error",
    description: "Failed to generate a tip.",
  });
};
