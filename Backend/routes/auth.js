const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const auth = require("../middleware/auth");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimit");
const {
  registerValidation, loginValidation,
  forgotPasswordValidation, resetPasswordValidation,
  changePasswordValidation, updateProfileValidation,
} = require("../middleware/validation");

router.post("/register", authLimiter, registerValidation, ctrl.register);
router.post("/login", authLimiter, loginValidation, ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", auth, ctrl.getCurrentUser);
router.patch("/me", auth, updateProfileValidation, ctrl.updateProfile);

router.get("/verify-email/:token", ctrl.verifyEmail);
router.post("/forgot-password", passwordResetLimiter, forgotPasswordValidation, ctrl.forgotPassword);
router.post("/reset-password/:token", passwordResetLimiter, resetPasswordValidation, ctrl.resetPassword);
router.post("/change-password", auth, changePasswordValidation, ctrl.changePassword);

router.get("/sessions", auth, ctrl.listSessions);
router.delete("/sessions/:id", auth, ctrl.revokeSession);

module.exports = router;
