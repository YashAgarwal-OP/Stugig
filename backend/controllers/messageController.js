const Message = require('../models/Message');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

// @desc    Get all conversation threads for the authenticated user
//          Returns jobs where user is client or accepted freelancer
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Step 1: Find jobs where user is involved (client or accepted freelancer)
    const userJobs = await Job.find({
      $or: [
        { clientId: req.user._id },
        { status: { $in: ['in-progress', 'completed'] } } // Jobs with accepted bids
      ]
    }).select('_id acceptedBidId clientId status title');

    // Filter to only include jobs where user is the accepted freelancer OR the client
    const relevantJobIds = [];
    for (const job of userJobs) {
      const isClient = job.clientId.toString() === req.user.id;
      
      if (isClient) {
        // If client, include if job has an accepted bid (chat enabled)
        if (job.acceptedBidId) {
          relevantJobIds.push(job._id);
        }
      } else if (job.acceptedBidId) {
        // Check if this user is the accepted freelancer
        const bid = await Bid.findById(job.acceptedBidId);
        if (bid && bid.freelancerId.toString() === req.user.id) {
          relevantJobIds.push(job._id);
        }
      }
    }

    if (relevantJobIds.length === 0) {
      return res.status(200).json([]);
    }

    // Step 2: For each job, get the latest message (or create a placeholder if no messages yet)
    const conversations = [];
    
    for (const jobId of relevantJobIds) {
      const latestMessage = await Message.findOne({ jobId })
        .populate('senderId', 'name profilePhotoUrl')
        .populate('receiverId', 'name profilePhotoUrl')
        .populate('jobId', 'title status')
        .sort({ createdAt: -1 });

      const job = await Job.findById(jobId).populate('clientId', 'name profilePhotoUrl');
      const bid = job.acceptedBidId ? await Bid.findById(job.acceptedBidId).populate('freelancerId', 'name profilePhotoUrl') : null;
      
      if (latestMessage) {
        // Conversation with messages exists
        conversations.push({
          _id: jobId,
          latestMessage
        });
      } else {
        // No messages yet — create a placeholder for UI
        const isClient = job.clientId._id.toString() === req.user.id;
        const otherUser = isClient ? bid?.freelancerId : job.clientId;
        
        conversations.push({
          _id: jobId,
          latestMessage: {
            _id: `placeholder-${jobId}`,
            jobId: {
              _id: job._id,
              title: job.title,
              status: job.status
            },
            senderId: req.user,
            receiverId: otherUser,
            content: 'Start a conversation...',
            createdAt: job.updatedAt || job.createdAt
          }
        });
      }
    }

    // Sort by most recent activity
    conversations.sort((a, b) => 
      new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt)
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error('[getConversations]', error);
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
