const User = require('../models/User');
const Job = require('../models/Job');
const Payment = require('../models/Payment');

// @desc    Get platform-level stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalJobs, payments] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Job.countDocuments(),
      Payment.find({ status: 'completed' })
    ]);

    const totalTransacted = payments.reduce((sum, p) => sum + (p.totalCharged || 0), 0);
    const totalRevenue = payments.reduce((sum, p) => sum + (p.commissionAmount || 0), 0);

    res.status(200).json({
      totalUsers,
      totalJobs,
      totalTransacted: Math.round(totalTransacted * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly revenue trend for chart (last 6 months)
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueTrend = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const payments = await Payment.find({
      status: 'completed',
      createdAt: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthMap[key] = { name: key, revenue: 0, volume: 0 };
    }

    payments.forEach((p) => {
      const key = new Date(p.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthMap[key]) {
        monthMap[key].revenue += p.commissionAmount || 0;
        monthMap[key].volume += p.totalCharged || 0;
      }
    });

    const data = Object.values(monthMap).map((m) => ({
      name: m.name,
      revenue: Math.round(m.revenue * 100) / 100,
      volume: Math.round(m.volume * 100) / 100
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent platform activity feed
// @route   GET /api/admin/activity
// @access  Private/Admin
exports.getActivity = async (req, res) => {
  try {
    const [recentJobs, recentPayments, recentUsers] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).limit(5).populate('clientId', 'name'),
      Payment.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5)
        .populate('clientId', 'name').populate('freelancerId', 'name'),
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5)
    ]);

    const events = [
      ...recentJobs.map((j) => ({
        description: `${j.clientId?.name || 'A client'} posted a new job: "${j.title}"`,
        createdAt: j.createdAt
      })),
      ...recentPayments.map((p) => ({
        description: `Payment of $${p.totalCharged?.toFixed(2)} completed between ${p.clientId?.name || 'client'} and ${p.freelancerId?.name || 'freelancer'}`,
        createdAt: p.createdAt
      })),
      ...recentUsers.map((u) => ({
        description: `New ${u.role} registered: ${u.name}`,
        createdAt: u.createdAt
      }))
    ];

    // Sort all events by most recent
    events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(events.slice(0, 15));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suspend or reactivate a user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.status(200).json({ message: `User ${user.status === 'active' ? 'activated' : 'suspended'}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'User account permanently deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
