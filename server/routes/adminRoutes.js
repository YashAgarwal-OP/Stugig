const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getRevenueData,
  getRecentActivity,
  getUsersList,
  suspendUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/auth');

// Protect all routes under this router – Admin only!
router.use(protect, requireRole('admin'));

router.route('/stats')
  .get(getAdminStats);

router.route('/revenue')
  .get(getRevenueData);

router.route('/activity')
  .get(getRecentActivity);

router.route('/users')
  .get(getUsersList);

router.route('/users/:id/suspend')
  .put(suspendUser);

router.route('/users/:id')
  .delete(deleteUser);

module.exports = router;
