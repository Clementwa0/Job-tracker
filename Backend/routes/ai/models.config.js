const { Groq } = require("groq-sdk");

const MODELS = {
  // Best overall reasoning + coding + analysis
  PRIMARY: "llama-3.3-70b-versatile",

  // Faster + cheaper fallback
  FAST: "openai/gpt-oss-20b",

  // Ultra-fast lightweight tasks
  LIGHT: "llama-3.1-8b-instant",

  // Agentic / web-search capable
  AGENT: "groq/compound",

  // Smaller agentic model
  AGENT_MINI: "groq/compound-mini",
};

const MODEL_FALLBACKS = {
  parsing: [
    MODELS.PRIMARY,
    MODELS.FAST,
    MODELS.LIGHT,
  ],

  matching: [
    MODELS.PRIMARY,
    MODELS.FAST,
  ],

  generation: [
    MODELS.PRIMARY,
    MODELS.FAST,
  ],

  extraction: [
    MODELS.FAST,
    MODELS.LIGHT,
  ],

  chat: [
    MODELS.FAST,
    MODELS.LIGHT,
  ],

  reasoning: [
    MODELS.PRIMARY,
    MODELS.AGENT,
  ],
};

const TEMPERATURE = {
  PARSING: 0.1,
  MATCHING: 0.2,
  EXTRACTION: 0.2,
  GENERATION: 0.6,
  IMPROVEMENT: 0.7,
  TIPS: 0.8,
  CHAT: 0.7,
};

const RETRY_CONFIG = {
  maxRetriesPerKey: 2,
  baseDelay: 1000,
  maxDelay: 10000,
};

const TOKEN_LIMITS = {
  SMALL: 1024,
  MEDIUM: 4096,
  LARGE: 8192,
  XL: 16384,
};

module.exports = {
  MODELS,
  MODEL_FALLBACKS,
  TEMPERATURE,
  TOKEN_LIMITS,
  RETRY_CONFIG,
};