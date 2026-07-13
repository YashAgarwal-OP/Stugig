const Message = require('../models/Message');

// @desc    Get messages for a conversation/job
// @route   GET /api/messages/:conversationId
// @access  Private
const getConversationMessages = async (req, res) => {
  try {
    // Note: Treating the route's :conversationId parameter as jobId
    const messages = await Message.find({ jobId: req.params.conversationId })
      .populate('senderId', 'name avatarUrl')
      .populate('receiverId', 'name avatarUrl')
      .sort('createdAt');
      
    res.json(messages);
  } catch (error) {
    console.error('getConversationMessages Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user conversations (latest message per job)
// @route   GET /api/messages
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$jobId",
          latestMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    // Populate the User details and Job details on the latest messages
    await Message.populate(conversations, [
      {
        path: 'latestMessage.senderId latestMessage.receiverId',
        select: 'name avatarUrl',
        model: 'User'
      },
      {
        path: 'latestMessage.jobId',
        select: 'title',
        model: 'Job'
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('getUserConversations Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send a message in a conversation (REST fallback + socket emit)
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params; // treated as jobId
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'receiverId and content are required' });
    }

    const message = await Message.create({
      jobId: conversationId,
      senderId: req.user._id,
      receiverId,
      content,
    });

    await message.populate('senderId', 'name avatarUrl');
    await message.populate('receiverId', 'name avatarUrl');

    res.status(201).json(message);
  } catch (error) {
    console.error('sendMessage Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getConversationMessages,
  getUserConversations,
  sendMessage,
};
