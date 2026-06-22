const rateLimit = require("express-rate-limit");

const aiUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.userId ? String(req.userId) : req.ip),
  message: { success: false, message: "AI rate limit exceeded. Try again later." },
});

module.exports = { aiUserLimiter };
