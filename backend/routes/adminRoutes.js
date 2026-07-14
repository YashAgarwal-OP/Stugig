const express = require('express');
const {
  getStats,
  getRevenueTrend,
  getActivity,
  getUsers,
  suspendUser,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/revenue', getRevenueTrend);
router.get('/activity', getActivity);
router.get('/users', getUsers);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
