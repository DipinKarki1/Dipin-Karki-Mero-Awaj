import User from '../models/User.js';
import mongoose from 'mongoose';
import { sendTokenResponse } from '../utils/authUtils.js';

const getAuthorityCategoryFromEmail = (email) => {
  if (!email) return null;
  const local = email.split('@')[0]?.toLowerCase() || '';
  if (local.includes('road')) return 'Road';
  if (local.includes('water')) return 'Water';
  if (local.includes('electric')) return 'Electricity';
  return null;
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, authorityCategory } = req.body;
    console.log("Registration attempt:", { name, email, role, authorityCategory });

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected. Please ensure MongoDB is running.");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      authorityCategory: role === 'authority' ? authorityCategory : null,
    });

    console.log("User created successfully:", user.email);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Registration Error:", err.message);
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
