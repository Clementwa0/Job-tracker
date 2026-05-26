const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  refreshCookieOptions,
} = require("../utils/tokens");
const { sendMail, templates } = require("../utils/mailer");
const jwt = require("jsonwebtoken");

const GENERIC_INVALID = "Invalid credentials"; // prevents enumeration

async function issueSession(user, req, res) {
  // Create session entry first so we can embed sid in refresh token
  const session = user.sessions.create({
    refreshTokenHash: "placeholder",
    userAgent: req.headers["user-agent"],
    ip: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  user.sessions.push(session);

  const refreshToken = signRefreshToken(user._id, session._id);
  session.refreshTokenHash = hashToken(refreshToken);

  // Cap sessions to last 5
  if (user.sessions.length > 5) {
    user.sessions = user.sessions.slice(-5);
  }
  user.lastLoginAt = new Date();
  user.loginHistory.push({ ip: req.ip, userAgent: req.headers["user-agent"], success: true });
  if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);

  await user.save();

  const accessToken = signAccessToken(user._id);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  return { accessToken, refreshToken };
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password } = req.body;
    if (await User.findOne({ email })) {
      // Don't leak: pretend success
      return res.json({ success: true, message: "If the email is available, an account was created. Check inbox." });
    }

    const user = new User({ name, email, password });
    const verifyToken = user.createEmailVerificationToken();
    await user.save();

    const url = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    const tpl = templates.verifyEmail(user.name, url);
    await sendMail({ to: user.email, ...tpl });

    const { accessToken } = await issueSession(user, req, res);
    res.status(201).json({
      success: true,
      message: "Registered. Please verify your email.",
      data: { user: user.toJSON(), token: accessToken },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password +sessions");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: GENERIC_INVALID });
    }

    const { accessToken } = await issueSession(user, req, res);
    res.json({
      success: true,
      message: "Login successful",
      data: { user: user.toJSON(), token: accessToken },
    });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.userId).select("+sessions");
    if (!user) return res.status(401).json({ success: false, message: "Invalid session" });

    const session = user.sessions.id(decoded.sid);
    const incomingHash = hashToken(token);
    if (!session || session.refreshTokenHash !== incomingHash) {
      // Token reuse / theft detected — nuke all sessions
      user.sessions = [];
      await user.save();
      res.clearCookie("refreshToken", refreshCookieOptions());
      return res.status(401).json({ success: false, message: "Session revoked" });
    }
    if (session.expiresAt < new Date()) {
      session.deleteOne();
      await user.save();
      return res.status(401).json({ success: false, message: "Session expired" });
    }

    // Rotate
    const newRefresh = signRefreshToken(user._id, session._id);
    session.refreshTokenHash = hashToken(newRefresh);
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    const accessToken = signAccessToken(user._id);
    res.cookie("refreshToken", newRefresh, refreshCookieOptions());
    res.json({ success: true, data: { token: accessToken, user: user.toJSON() } });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId).select("+sessions");
        if (user) {
          const session = user.sessions.id(decoded.sid);
          if (session) { session.deleteOne(); await user.save(); }
        }
      } catch { /* ignore */ }
    }
    res.clearCookie("refreshToken", refreshCookieOptions());
    res.json({ success: true, message: "Logged out" });
  } catch (err) { next(err); }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    res.json({ success: true, data: { user: req.user.toJSON() } });
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const tokenHash = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationTokenHash +emailVerificationExpires");
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ success: true, message: "Email verified" });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond success to prevent enumeration
    if (user) {
      const token = user.createPasswordResetToken();
      await user.save();
      const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
      const tpl = templates.resetPassword(user.name, url);
      await sendMail({ to: user.email, ...tpl });
    }
    res.json({ success: true, message: "If the email exists, a reset link was sent." });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const tokenHash = hashToken(req.params.token);
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordTokenHash +resetPasswordExpires +sessions");
    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    user.sessions = []; // invalidate all sessions
    await user.save();
    res.json({ success: true, message: "Password reset. Please log in again." });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select("+password +sessions");
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    user.password = newPassword;
    user.sessions = [];
    await user.save();
    res.clearCookie("refreshToken", refreshCookieOptions());
    res.json({ success: true, message: "Password changed" });
  } catch (err) { next(err); }
};

exports.listSessions = async (req, res) => {
  const user = await User.findById(req.userId).select("+sessions");
  res.json({
    success: true,
    data: user.sessions.map((s) => ({
      id: s._id, ip: s.ip, userAgent: s.userAgent,
      createdAt: s.createdAt, expiresAt: s.expiresAt,
    })),
  });
};

exports.revokeSession = async (req, res) => {
  const user = await User.findById(req.userId).select("+sessions");
  const s = user.sessions.id(req.params.id);
  if (!s) return res.status(404).json({ success: false });
  s.deleteOne();
  await user.save();
  res.json({ success: true });
};
