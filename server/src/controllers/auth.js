import User from '../models/User.js';
import mongoose from 'mongoose';
import { sendTokenResponse } from '../utils/authUtils.js';
import { sendEmail } from '../utils/email.js';
import { generateOtp, hashOtp } from '../utils/otp.js';

const OTP_TTL_MINUTES = 10;

const getAuthorityCategoryFromEmail = (email) => {
  if (!email) return null;
  const local = email.split('@')[0]?.toLowerCase() || '';
  if (local.includes('road')) return 'Road';
  if (local.includes('water')) return 'Water';
  if (local.includes('electric')) return 'Electricity';
  return null;
};

const getOtpExpiry = () => new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

const buildOtpEmail = ({ name, otp, purpose }) => {
  const label = purpose === 'reset' ? 'password reset' : 'email verification';
  const title = purpose === 'reset' ? 'Password Reset Code' : 'Email Verification Code';
  const greeting = name ? `Hi ${name},` : 'Hi,';
  const text = `${greeting}\n\nYour ${label} code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p>${greeting}</p>
      <p>Your ${label} code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
      <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
      <p style="margin-top: 24px;">– Mero Awaj</p>
    </div>
  `;

  return { subject: `Mero Awaj ${title}`, text, html };
};

const issueEmailOtp = async (user) => {
  const { otp, otpHash } = generateOtp();
  user.emailOtpHash = otpHash;
  user.emailOtpExpires = getOtpExpiry();
  await user.save();

  const email = buildOtpEmail({ name: user.name, otp, purpose: 'verify' });
  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};

const issueResetOtp = async (user) => {
  const { otp, otpHash } = generateOtp();
  user.resetOtpHash = otpHash;
  user.resetOtpExpires = getOtpExpiry();
  await user.save();

  const email = buildOtpEmail({ name: user.name, otp, purpose: 'reset' });
  await sendEmail({
    to: user.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, authorityCategory } = req.body;
    console.log('Registration attempt:', { name, email, role, authorityCategory });

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected. Please ensure MongoDB is running.');
    }

    const existing = await User.findOne({ email });

    if (existing) {
      if (!existing.emailVerified) {
        await issueEmailOtp(existing);
        return res.status(200).json({
          success: true,
          requiresVerification: true,
          message: 'Verification code re-sent to your email',
          email: existing.email,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      authorityCategory: role === 'authority' ? authorityCategory : null,
      emailVerified: false,
    });

    await issueEmailOtp(user);

    console.log('User created successfully:', user.email);
    return res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Verification code sent to your email',
      email: user.email,
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Verify email OTP
// @route   POST /api/v1/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({ email }).select('+emailOtpHash +emailOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    if (user.emailVerified) {
      return sendTokenResponse(user, 200, res);
    }

    if (!user.emailOtpHash || !user.emailOtpExpires || user.emailOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new code.',
      });
    }

    if (hashOtp(otp) !== user.emailOtpHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    user.emailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Resend email OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
export const resendEmailOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    await issueEmailOtp(user);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.role === 'authority') {
      if (!user.name && !name) {
        return res.status(400).json({
          success: false,
          message: 'Authority name is required',
        });
      }

      let needsUpdate = false;
      if (!user.name && name) {
        user.name = name;
        needsUpdate = true;
      }

      if (!user.authorityCategory) {
        const derivedCategory = getAuthorityCategoryFromEmail(user.email);
        if (derivedCategory) {
          user.authorityCategory = derivedCategory;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await user.save();
      }
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid role for this account',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.emailVerified) {
      await issueEmailOtp(user);
      return res.status(401).json({
        success: false,
        requiresVerification: true,
        message: 'Email not verified. OTP sent to your email.',
        email: user.email,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update profile (name/email)
// @route   PUT /api/v1/auth/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const existing = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    const user = await User.findById(req.user.id);
    user.name = name;
    user.email = email;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        authorityCategory: user.authorityCategory || null,
        civicPoints: user.civicPoints,
        rank: user.rank,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/me/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Request password reset OTP
// @route   POST /api/v1/auth/password/forgot
// @access  Public
export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that account exists, an OTP has been sent',
      });
    }

    await issueResetOtp(user);

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/password/reset
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findOne({ email }).select('+resetOtpHash +resetOtpExpires +password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    if (!user.resetOtpHash || !user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new code.',
      });
    }

    if (hashOtp(otp) !== user.resetOtpHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    user.password = newPassword;
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
