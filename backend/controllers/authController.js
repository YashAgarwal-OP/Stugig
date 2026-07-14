const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const buildUserPayload = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  tagline: user.tagline,
  bio: user.bio,
  phone: user.phone,
  location: user.location,
  profilePhotoUrl: user.profilePhotoUrl,
  skills: user.skills,
  languages: user.languages,
  yearsOfExperience: user.yearsOfExperience,
  rating: user.rating,
  reviewCount: user.reviewCount,
  createdAt: user.createdAt,
});
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_for_stugig', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, skills } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      skills: role === 'freelancer' ? (skills || []) : []
    });

    const token = generateToken(user._id);

    // Send welcome email (non-blocking — failure never breaks signup)
    sendWelcomeEmail(user).catch(() => {});

    res.status(201).json({
      success: true,
      token,
      ...buildUserPayload(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Block suspended accounts
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      ...buildUserPayload(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    // Always return 200 — never reveal whether the email exists
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate a cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Remove any existing tokens for this user, then save new one
    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    await sendPasswordResetEmail(user, rawToken);

    res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('[forgotPassword]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Hash the incoming token and look it up
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, error: 'Reset token is invalid or has expired' });
    }

    // Hash new password and update user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(resetRecord.userId, { password: hashedPassword });

    // Clean up the used token
    await PasswordResetToken.deleteMany({ userId: resetRecord.userId });

    res.status(200).json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
