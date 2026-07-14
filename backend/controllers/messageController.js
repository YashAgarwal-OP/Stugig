const Message = require('../models/Message');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// @desc    Get all conversation threads for the authenticated user
//          Returns one entry per job the user has messaged on, with the latest message
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find the most recent message in each job thread where the user is a participant
    const threads = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$jobId',
          latestMessageId: { $first: '$_id' }
        }
      }
    ]);

    if (threads.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch the full latest message for each thread
    const latestMessageIds = threads.map((t) => t.latestMessageId);
    const messages = await Message.find({ _id: { $in: latestMessageIds } })
      .populate('senderId', 'name profilePhotoUrl')
      .populate('receiverId', 'name profilePhotoUrl')
      .populate('jobId', 'title status')
      .sort({ createdAt: -1 });

    // Format response as a list of conversation objects
    const conversations = messages.map((msg) => ({
      _id: msg.jobId?._id || msg.jobId,
      latestMessage: msg
    }));

    res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages in a job thread
// @route   GET /api/messages/:jobId
// @access  Private
exports.getMessagesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Ensure the user is a participant (client or accepted freelancer on this job)
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isClient = job.clientId.toString() === req.user.id;

    let isFreelancer = false;
    if (job.acceptedBidId) {
      const bid = await Bid.findById(job.acceptedBidId);
      if (bid && bid.freelancerId.toString() === req.user.id) {
        isFreelancer = true;
      }
    }

    // Also allow any participants who already have messages in the thread
    const hasMessages = await Message.exists({
      jobId,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    });

    if (!isClient && !isFreelancer && !hasMessages) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ jobId })
      .populate('senderId', 'name profilePhotoUrl')
      .populate('receiverId', 'name profilePhotoUrl')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
