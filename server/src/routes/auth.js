import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  verifyEmail,
  resendEmailOtp,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendEmailOtp);
router.post('/password/forgot', requestPasswordReset);
router.post('/password/reset', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, updatePassword);

export default router;
