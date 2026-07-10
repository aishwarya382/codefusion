const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

module.exports = router;
