const { Groq } = require("groq-sdk");

const rawKeys =
  process.env.GROQ_API_KEYS ||
  process.env.GROQ_API_KEY ||
  "";

const API_KEYS = rawKeys
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);

if (API_KEYS.length === 0) {
  throw new Error("No Groq API keys configured");
}

console.log(`Loaded ${API_KEYS.length} API keys`);

async function chat({
  model,
  messages,
  temperature = 0.3,
  useFallback = true,
}) {
  const modelsToTry = Array.isArray(model)
    ? model
    : [model];

  let lastError = null;

  for (const currentModel of modelsToTry) {
    for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
      const apiKey = API_KEYS[keyIndex];

      try {
        const groq = new Groq({ apiKey });

        const res =
          await groq.chat.completions.create({
            model: currentModel,
            temperature,
            response_format: {
              type: "json_object",
            },
            messages,
          });

        const raw =
          res.choices?.[0]?.message?.content;

        if (!raw) {
          throw new Error(
            "Empty response from Groq"
          );
        }

        return JSON.parse(raw);
      } catch (err) {
        lastError = err;

        const errorMessage =
          err?.message || String(err);

        console.error(
          `[Groq Error]
Model: ${currentModel}
Key: ${keyIndex + 1}
Error: ${errorMessage}`
        );

        const isRateLimit =
          errorMessage.includes("rate_limit") ||
          errorMessage.includes("quota") ||
          errorMessage.includes("429");

        if (isRateLimit) {
          console.log(
            `Key ${keyIndex + 1} rate limited, trying next key...`
          );
          continue;
        }

        if (!useFallback) {
          throw err;
        }
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "All models and API keys failed"
    )
  );
}

module.exports = {
  chat,
  API_KEYS,
};