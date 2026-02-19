const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/* ===========================
   JWT TOKEN GENERATOR
=========================== */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/* ===========================
   EMAIL TRANSPORTER
=========================== */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP READY");
  }
});

/* ===========================
   REGISTER
=========================== */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: user.toJSON(), token }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ===========================
   LOGIN
=========================== */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isValid = await user.comparePassword(password);
    if (!isValid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/* ===========================
   FORGOT PASSWORD
=========================== */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: 'No account found with that email.'
      });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 15 minutes.</p>
      `
    });

    res.json({
      success: true,
      message: "Reset email sent. Check inbox or spam."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message
    });
  }
};

/* ===========================
   RESET PASSWORD
=========================== */
const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
