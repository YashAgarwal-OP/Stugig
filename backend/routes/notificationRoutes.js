const express = require('express');
const {
  getNotifications,
  markRead,
  markAllRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// read-all must be registered before /:id to avoid param collision
router.put('/read-all', protect, markAllRead);

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markRead);

module.exports = router;
