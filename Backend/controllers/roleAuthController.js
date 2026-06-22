const { validationResult } = require("express-validator");
const User = require("../models/User");
const Company = require("../models/Company");
const { slugify } = require("../utils/slugify");
const { sendMail, templates } = require("../utils/mailer");
const authController = require("./authController");

const GENERIC_INVALID = "Invalid credentials";

async function authenticateCredentials(email, password, requiredRole) {
  const user = await User.findOne({ email }).select("+password +sessions");
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error(GENERIC_INVALID);
    err.statusCode = 401;
    throw err;
  }
  if (user.accountStatus === "suspended") {
    const err = new Error("Account suspended");
    err.statusCode = 403;
    throw err;
  }
  if (requiredRole && user.role !== requiredRole) {
    const err = new Error(GENERIC_INVALID);
    err.statusCode = 403;
    throw err;
  }
  return user;
}

async function respondWithSession(user, req, res, message) {
  const { accessToken } = await authController.issueSession(user, req, res);
  res.json({
    success: true,
    message,
    data: { user: user.toJSON(), token: accessToken },
  });
}

/**
 * POST /api/employer/register
 */
exports.employerRegister = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { companyName, email, password, industry, location, website, description } = req.body;

    if (await User.findOne({ email })) {
      return res.json({
        success: true,
        message: "If the email is available, an account was created. Check inbox.",
      });
    }

    const user = new User({
      name: companyName.trim(),
      email,
      password,
      role: "employer",
    });
    const verifyToken = user.createEmailVerificationToken();
    await user.save();

    const baseSlug = slugify(companyName);
    let slug = baseSlug;
    let n = 0;
    while (await Company.findOne({ slug })) {
      n += 1;
      slug = `${baseSlug}-${n}`;
    }

    const autoApprove = process.env.EMPLOYER_AUTO_APPROVE_COMPANY !== "false";
    const company = await Company.create({
      name: companyName.trim(),
      slug,
      industry,
      location,
      website,
      description,
      createdBy: user._id,
      status: autoApprove ? "approved" : "pending",
    });

    user.employerCompanyId = company._id;
    await user.save();

    const url = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    const tpl = templates.verifyEmail(user.name, url);
    await sendMail({ to: user.email, ...tpl });

    const { accessToken } = await authController.issueSession(user, req, res);
    res.status(201).json({
      success: true,
      message: "Employer account created. Complete your company profile in the dashboard.",
      data: { user: user.toJSON(), token: accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/employer/login
 */
exports.employerLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await authenticateCredentials(email, password, "employer");
    await respondWithSession(user, req, res, "Login successful");
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * POST /api/admin/login
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await authenticateCredentials(email, password, "admin");
    await respondWithSession(user, req, res, "Login successful");
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

/**
 * POST /api/employer/forgot-password
 */
exports.employerForgotPassword = async (req, res, next) => {
  req.body.resetPath = "/employer/reset-password";
  return authController.forgotPassword(req, res, next);
};

module.exports.authenticateCredentials = authenticateCredentials;
