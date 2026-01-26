const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../middleware/validation');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getCurrentUser);

// Password reset
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, resetPassword);

// Logout (if you handle token revocation/blacklist)
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
