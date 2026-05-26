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

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
