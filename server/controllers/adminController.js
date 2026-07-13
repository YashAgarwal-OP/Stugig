const User = require('../models/User');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const Bid = require('../models/Bid');

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();

    // Aggregate payments
    const payments = await Payment.find({ status: 'completed' });
    const totalTransacted = payments.reduce((sum, p) => sum + p.totalCharged, 0);
    const totalRevenue = payments.reduce((sum, p) => sum + p.commissionAmount, 0);

    res.json({
      totalUsers,
      totalJobs,
      totalTransacted,
      totalRevenue,
    });
  } catch (error) {
    console.error('getAdminStats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get revenue over time data
// @route   GET /api/admin/revenue
// @access  Private (Admin)
const getRevenueData = async (req, res) => {
  try {
    // For MVP, return monthly values for last 6 months
    const data = [
      { name: 'Jan', revenue: 120 },
      { name: 'Feb', revenue: 210 },
      { name: 'Mar', revenue: 180 },
      { name: 'Apr', revenue: 350 },
      { name: 'May', revenue: 420 },
      { name: 'Jun', revenue: 580 },
    ];
    res.json(data);
  } catch (error) {
    console.error('getRevenueData Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent activity feed
// @route   GET /api/admin/activity
// @access  Private (Admin)
const getRecentActivity = async (req, res) => {
  try {
    // Fetch recent users, jobs, payments
    const recentUsers = await User.find().sort('-createdAt').limit(3).select('name role createdAt');
    const recentJobs = await Job.find().sort('-createdAt').limit(3).select('title createdAt');
    const recentPayments = await Payment.find().sort('-createdAt').limit(3)
      .populate('clientId', 'name')
      .populate('freelancerId', 'name')
      .select('totalCharged createdAt');

    const activity = [];

    recentUsers.forEach(u => {
      activity.push({
        type: 'user',
        description: `New user ${u.name} registered as a ${u.role}`,
        createdAt: u.createdAt
      });
    });

    recentJobs.forEach(j => {
      activity.push({
        type: 'job',
        description: `New job request posted: "${j.title}"`,
        createdAt: j.createdAt
      });
    });

    recentPayments.forEach(p => {
      activity.push({
        type: 'payment',
        description: `Payment of $${p.totalCharged?.toFixed(2)} completed from ${p.clientId?.name || 'Client'} to ${p.freelancerId?.name || 'Freelancer'}`,
        createdAt: p.createdAt
      });
    });

    // Sort by newest
    activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(activity.slice(0, 10));
  } catch (error) {
    console.error('getRecentActivity Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsersList = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort('-createdAt');
    res.json(users);
  } catch (error) {
    console.error('getUsersList Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Suspend or unsuspend a user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.json({ message: `User status changed to ${user.status}`, user });
  } catch (error) {
    console.error('suspendUser Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAdminStats,
  getRevenueData,
  getRecentActivity,
  getUsersList,
  suspendUser,
  deleteUser,
};
