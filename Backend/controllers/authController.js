const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register User
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

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
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: user.toJSON(), token }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { user: user.toJSON() } });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'YourApp'} Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your password',
      html: `
  <div style="background:#f4f6f8;padding:40px 0;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);font-family:Arial,sans-serif;">

      <!-- Header -->
      <div style="background:#111827;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;">
          ${process.env.APP_NAME || 'YourApp'}
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;color:#111827;">
        <h2 style="margin-top:0;">Reset your password</h2>

        <p style="font-size:15px;color:#374151;">
          Hi ${user.name || 'there'},
        </p>

        <p style="font-size:15px;color:#374151;line-height:1.6;">
          We received a request to reset the password for your account.  
          Click the button below to choose a new password.
        </p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
             style="
               background:#4f46e5;
               color:#ffffff;
               padding:14px 28px;
               text-decoration:none;
               border-radius:8px;
               font-weight:600;
               font-size:15px;
               display:inline-block;
             ">
            Reset Password
          </a>
        </div>

        <p style="font-size:14px;color:#6b7280;line-height:1.6;">
          This link will expire in <strong>15 minutes</strong> for security reasons.
        </p>

        <p style="font-size:14px;color:#6b7280;line-height:1.6;">
          If you didn’t request a password reset, you can safely ignore this email.
          Your account will remain secure.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />

        <p style="font-size:13px;color:#9ca3af;word-break:break-all;">
          If the button above doesn’t work, copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color:#4f46e5;">${resetUrl}</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:20px;text-align:center;">
        <p style="font-size:12px;color:#9ca3af;margin:0;">
          © ${new Date().getFullYear()} ${process.env.APP_NAME || 'YourApp'}. All rights reserved.
        </p>
      </div>

    </div>
  </div>
  `
    });
    res.json({
      success: true,
      message:
        'We’ve sent a password reset link to your email. Check your inbox (and spam folder just in case).'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong while sending the reset email. Try again later.',
      error: error.message
    });
  }
};


// Reset Password
const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getCurrentUser, forgotPassword, resetPassword };
