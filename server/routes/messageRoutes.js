const express = require('express');
const router = express.Router();
const {
  getConversationMessages,
  getUserConversations,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getUserConversations);

router.route('/:conversationId')
  .get(protect, getConversationMessages)
  .post(protect, sendMessage);

module.exports = router;
