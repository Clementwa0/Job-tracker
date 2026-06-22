const { body } = require("express-validator");

const registerValidation = [
  body("name").trim().notEmpty().isLength({ max: 80 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

const forgotPasswordValidation = [body("email").isEmail().normalizeEmail()];

const resetPasswordValidation = [
  body("password").isLength({ min: 8 }),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
];

const updateProfileValidation = [
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("jobTitle").optional().trim().isLength({ max: 120 }),
  body("location").optional().trim().isLength({ max: 120 }),
  body("phone").optional().trim().isLength({ max: 30 }),
  body("avatarUrl").optional({ checkFalsy: true }).trim().isURL().withMessage("avatarUrl must be a valid URL"),
];

const employerRegisterValidation = [
  body("companyName").trim().notEmpty().isLength({ max: 200 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain a number"),
  body("industry").optional().trim().isLength({ max: 120 }),
  body("location").optional().trim().isLength({ max: 120 }),
  body("website").optional({ checkFalsy: true }).trim().isURL(),
  body("description").optional().trim().isLength({ max: 2000 }),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation,
  employerRegisterValidation,
};
