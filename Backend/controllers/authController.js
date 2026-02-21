const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register user
const register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: user.toJSON(), token },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: { user: user.toJSON(), token },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get current logged-in user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and expiry
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sgMail.send({
      to: user.email,
      from: `${process.env.APP_NAME || "JobTracker"} <${process.env.SENDER_EMAIL}>`,
      subject: "Reset your password",
      html: `
    <h2>Password Reset</h2>
    <p>Hi ${user.name || "there"},</p>
    <p>Click below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link expires in 15 minutes.</p>
  `,
    });

    res.json({
      success: true,
      message: "Reset email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error.response?.body || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    // Hash incoming token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
};
