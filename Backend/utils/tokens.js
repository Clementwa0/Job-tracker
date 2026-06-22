const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const signAccessToken = (userId, role = "user") =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });

const signRefreshToken = (userId, sessionId) =>
  jwt.sign({ userId, sid: sessionId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
});

module.exports = { signAccessToken, signRefreshToken, hashToken, refreshCookieOptions };
