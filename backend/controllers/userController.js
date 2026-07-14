const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get a user's public profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured freelancers (highest rated, active)
// @route   GET /api/users?featured=true  OR  GET /api/users/featured
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { featured, role, limit = 8 } = req.query;

    const query = { status: 'active' };

    if (role) query.role = role;
    if (featured === 'true') query.role = 'freelancer';

    const users = await User.find(query)
      .select('-password')
      .sort({ rating: -1, reviewCount: -1 })
      .limit(Number(limit));

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update the authenticated user's profile (supports multipart for photo upload)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'tagline', 'bio', 'phone', 'location'];
    const freelancerFields = ['yearsOfExperience', 'skills', 'languages'];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Freelancer-only fields
    if (req.user.role === 'freelancer') {
      freelancerFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          // TagInput sends JSON-stringified arrays via multipart
          if (field === 'skills' || field === 'languages') {
            try {
              updates[field] = typeof req.body[field] === 'string'
                ? JSON.parse(req.body[field])
                : req.body[field];
            } catch {
              updates[field] = req.body[field];
            }
          } else {
            updates[field] = req.body[field];
          }
        }
      });
    }

    // Profile photo — set by multer middleware
    if (req.file) {
      // Store the relative URL path that can be served statically
      updates.profilePhotoUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
