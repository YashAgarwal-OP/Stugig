const express = require('express');
const { getConversations, getMessagesByJob } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:jobId', protect, getMessagesByJob);

module.exports = router;
