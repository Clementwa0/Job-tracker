const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the short-lived access token and loads the user.
 * Refresh-token rotation is handled by /api/auth/refresh.
 */
const auth = async (req, res, next) => {
  try {
    const header = req.header("Authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided", code: "NO_TOKEN" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      const code = e.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
      return res.status(401).json({ success: false, message: "Invalid or expired token", code });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists", code: "USER_GONE" });
    }

    // Session invalidation after password change
    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({ success: false, message: "Session expired", code: "SESSION_INVALID" });
    }

    if (!user.emailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
      return res.status(403).json({ success: false, message: "Email not verified", code: "EMAIL_UNVERIFIED" });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

module.exports = auth;
module.exports.requireRole = requireRole;
