const User = require('../models/User');

// @desc    Get all users (with optional filters)
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const { role, featured } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    let usersQuery = User.find(query).select('-passwordHash');

    if (featured === 'true') {
      // For MVP, featured users are freelancers with rating >= 4
      query.role = 'freelancer';
      usersQuery = User.find(query).select('-passwordHash').sort({ rating: -1 }).limit(4);
    }

    const users = await usersQuery;
    res.json(users);
  } catch (error) {
    console.error('getUsers Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('getUserById Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
};
