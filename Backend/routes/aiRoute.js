const { Groq } = require("groq-sdk");

exports.config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { cvText } = req.body;

  if (!cvText || cvText.trim().length < 50) {
    return res.status(400).json({ error: "CV text too short." });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const chatStream = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct",
      messages: [
        {
          role: "system",
          content: `You are an expert CV reviewer. Evaluate formatting, structure, skills, achievements, ATS compatibility, and clarity. Respond with bullet points per section.`,
        },
        {
          role: "user",
          content: `Please review this CV:\n\n${cvText.slice(0, 5000)}`
        },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 1500,
      top_p: 0.95,
    });

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
    });

    for await (const chunk of chatStream) {
      const token = chunk.choices?.[0]?.delta?.content || "";
      res.write(token);
    }

    res.end();
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).end("Something went wrong");
  }
};
