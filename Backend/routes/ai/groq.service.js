const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function chat({ model, messages, temperature = 0.3 }) {
  const res = await groq.chat.completions.create({
    model,
    temperature,
    response_format: { type: "json_object" },
    messages,
  });

  const raw = res.choices[0]?.message?.content || "";

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");
    return JSON.parse(match[0]);
  }
}

module.exports = { chat };