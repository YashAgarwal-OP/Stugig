const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for nested routes like /api/jobs/:id/bids
const {
  createBid,
  getJobBids,
  updateBidStatus,
  getFreelancerBids,
} = require('../controllers/bidController');
const { protect, requireRole } = require('../middleware/auth');

router.route('/bids/my-bids')
  .get(protect, requireRole('freelancer'), getFreelancerBids);

// Note: If mounted at /api/jobs/:id/bids in jobRoutes, these will handle the base path
router.route('/')
  .post(protect, requireRole('freelancer'), createBid)
  .get(protect, requireRole('client'), getJobBids);

// The PUT route is for /api/bids/:id, so we need to mount it separately in server.js
// Wait, the router handles /api/bids/:id if mounted at /api/bids
// So I will create two separate routers or handle it elegantly. 
// Let's handle it by defining paths explicitly assuming this is mounted at /api/bids in server.js
// and we'll handle the nested routes in jobRoutes.js OR just define them here.

// Assuming this is mounted at /api
router.route('/jobs/:id/bids')
  .post(protect, requireRole('freelancer'), createBid)
  .get(protect, requireRole('client'), getJobBids);

router.route('/bids/:id')
  .put(protect, requireRole('client'), updateBidStatus);

module.exports = router;
