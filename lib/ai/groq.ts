type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatOptions = {
  model: string | readonly string[];
  messages: ChatMessage[];
  temperature?: number;
  useFallback?: boolean;
};

export const MODEL_FALLBACKS = {
  parsing: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"],
  matching: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"],
  generation: ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"],
  extraction: ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"],
  safety: [
    "openai/gpt-oss-safeguard-20b",
    "meta-llama/llama-prompt-guard-2-86m",
    "meta-llama/llama-prompt-guard-2-22m",
  ],
} as const;

export const TEMPERATURE = {
  PARSING: 0.1,
  MATCHING: 0.2,
  EXTRACTION: 0.2,
  GENERATION: 0.6,
  IMPROVEMENT: 0.7,
  TIPS: 0.8,
} as const;

function apiKeys(): string[] {
  return (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/** Calls Groq's OpenAI-compatible endpoint and always returns the JSON object requested by callers. */
export async function chat({ model, messages, temperature = 0.3, useFallback = true }: ChatOptions): Promise<Record<string, unknown>> {
  const keys = apiKeys();
  if (!keys.length) throw new Error("AI service is not configured.");

  const models = Array.isArray(model) ? model : [model];
  let lastError: Error | undefined;

  for (const currentModel of models) {
    for (const apiKey of keys) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: currentModel,
            messages,
            temperature,
            response_format: { type: "json_object" },
          }),
        });
        const payload = (await response.json().catch(() => null)) as {
          choices?: Array<{ message?: { content?: string } }>;
          error?: { message?: string };
        } | null;

        if (!response.ok) {
          const error = new Error(payload?.error?.message || `Groq request failed (${response.status}).`);
          lastError = error;
          if (useFallback && isRetryable(response.status)) continue;
          throw error;
        }

        const content = payload?.choices?.[0]?.message?.content;
        if (!content) throw new Error("Groq returned an empty response.");
        const parsed: unknown = JSON.parse(content);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Groq returned an invalid JSON object.");
        }
        return parsed as Record<string, unknown>;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Groq request failed.");
        if (!useFallback) throw lastError;
      }
    }
  }

  throw lastError || new Error("All AI models failed.");
}
