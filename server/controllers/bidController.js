const Bid = require('../models/Bid');
const Job = require('../models/Job');
const Message = require('../models/Message');

// @desc    Create a bid for a job
// @route   POST /api/jobs/:id/bids
// @access  Private (Freelancer)
const createBid = async (req, res) => {
  try {
    const { quoteAmount, deliveryTime, coverMessage } = req.body;
    const jobId = req.params.id;

    if (!quoteAmount || !deliveryTime || !coverMessage) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for bids' });
    }

    // Check if freelancer already bid on this job
    const existingBid = await Bid.findOne({ jobId, freelancerId: req.user._id });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already submitted a bid for this job' });
    }

    const bid = new Bid({
      jobId,
      freelancerId: req.user._id,
      quoteAmount,
      deliveryTime,
      coverMessage,
      status: 'pending'
    });

    const createdBid = await bid.save();
    res.status(201).json(createdBid);
  } catch (error) {
    console.error('createBid Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bids for a specific job
// @route   GET /api/jobs/:id/bids
// @access  Private (Client/Job Owner)
const getJobBids = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view bids for this job' });
    }

    const bids = await Bid.find({ jobId }).populate('freelancerId', 'name avatarUrl rating skills');
    res.json(bids);
  } catch (error) {
    console.error('getJobBids Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update bid status (Accept/Reject)
// @route   PUT /api/bids/:id
// @access  Private (Client/Job Owner)
const updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const job = await Job.findById(bid.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }

    // Check ownership of the JOB
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update bids for this job' });
    }

    // If accepting this bid
    if (status === 'accepted') {
      if (job.status !== 'open') {
        return res.status(400).json({ message: 'Job is no longer open' });
      }

      // Update the selected bid
      bid.status = 'accepted';
      await bid.save();

      // Automatically update the Job status to 'in-progress'
      job.status = 'in-progress';
      await job.save();

      // Automatically reject all other pending bids for this job
      await Bid.updateMany(
        { jobId: job._id, _id: { $ne: bid._id }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );

      // Auto-create a seed message to establish the chat thread between client and freelancer
      // Only create if no messages exist for this job yet (idempotent)
      const existingMessage = await Message.findOne({ jobId: job._id });
      if (!existingMessage) {
        await Message.create({
          jobId: job._id,
          senderId: job.clientId,    // Client sends the initial message
          receiverId: bid.freelancerId,
          content: `Hi! I've accepted your bid for "${job.title}". Looking forward to working with you! 🎉`,
        });
      }

      res.json(bid);
    } else {
      // If just rejecting
      bid.status = 'rejected';
      const updatedBid = await bid.save();
      res.json(updatedBid);
    }

  } catch (error) {
    console.error('updateBidStatus Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all bids submitted by the logged-in freelancer
// @route   GET /api/bids/my-bids
// @access  Private (Freelancer)
const getFreelancerBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate({
        path: 'jobId',
        populate: { path: 'clientId', select: 'name avatarUrl rating' }
      })
      .sort('-createdAt');
    res.json(bids);
  } catch (error) {
    console.error('getFreelancerBids Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBid,
  getJobBids,
  updateBidStatus,
  getFreelancerBids,
};
