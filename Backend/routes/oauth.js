const express = require("express");
const crypto = require("crypto");
const { getSession } = require("@auth/express");
const { authConfig } = require("../config/auth");
const User = require("../models/User");
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshCookieOptions,
} = require("../utils/tokens");

const router = express.Router();

// Convenience entry points so the frontend can keep linking to /api/auth/...
router.get("/social/:provider", (req, res) => {
  const { provider } = req.params;
  if (!["google", "github"].includes(provider)) {
    return res.status(404).json({ success: false, message: "Unknown provider" });
  }
  const callbackUrl = "/api/auth/social/complete";
  res.redirect(
    `/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
});

router.get("/social/complete", async (req, res, next) => {
  try {
    const session = await getSession(req, authConfig);
    if (!session?.userId) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
    }

    const user = await User.findById(session.userId).select("+sessions");
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
    }

    // Create a refresh-token session (same shape as password login).
    const sessionDoc = user.sessions.create({
      refreshTokenHash: "pending",
      userAgent: req.get("user-agent") || "",
      ip: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    user.sessions.push(sessionDoc);

    const refreshToken = signRefreshToken(user._id, sessionDoc._id);
    sessionDoc.refreshTokenHash = hashToken(refreshToken);

    user.lastLoginAt = new Date();
    user.loginHistory.push({
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
      success: true,
    });
    await user.save();

    const accessToken = signAccessToken(user._id);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    res.redirect(
      `${process.env.CLIENT_URL}/oauth/callback?token=${accessToken}`
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
