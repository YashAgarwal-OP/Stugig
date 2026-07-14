const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');
const notify = require('../utils/notify');
const { sendBidAcceptedEmail } = require('../utils/sendEmail');

// @desc    Submit a bid on a job
// @route   POST /api/jobs/:id/bids
// @access  Private/Freelancer
exports.createBid = async (req, res) => {
  try {
    const { quoteAmount, deliveryTime, coverMessage } = req.body;
    const jobId = req.params.id;

    if (!quoteAmount || !deliveryTime || !coverMessage) {
      return res.status(400).json({ message: 'quoteAmount, deliveryTime, and coverMessage are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'This job is no longer open for bidding' });
    }

    if (job.clientId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own job' });
    }

    // Check for duplicate bid
    const existing = await Bid.findOne({ jobId, freelancerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a bid on this job' });
    }

    const bid = await Bid.create({
      jobId,
      freelancerId: req.user.id,
      quoteAmount: Number(quoteAmount),
      deliveryTime,
      coverMessage
    });

    // Notify the client that a new bid arrived
    const io = req.app.locals.io;
    await notify(io, {
      userId: job.clientId,
      type: 'bid_received',
      message: `${req.user.name} submitted a bid of $${quoteAmount} on "${job.title}"`,
      link: `/jobs/${jobId}`
    });

    const populated = await Bid.findById(bid._id).populate('freelancerId', 'name email rating profilePhotoUrl');
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids for a job (client only)
// @route   GET /api/jobs/:id/bids
// @access  Private/Client
exports.getBidsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only the job owner can see all bids
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bids for this job' });
    }

    const bids = await Bid.find({ jobId: req.params.id })
      .populate('freelancerId', 'name email rating profilePhotoUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or reject a bid
// @route   PUT /api/bids/:id
// @access  Private/Client
exports.updateBid = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
    }

    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const job = await Job.findById(bid.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }

    // Only the job owner can accept/reject bids
    if (job.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot modify bids on a job that is no longer open' });
    }

    bid.status = status;

    const io = req.app.locals.io;

    if (status === 'accepted') {
      bid.acceptedAt = new Date();

      // Move job to in-progress and record accepted bid
      job.status = 'in-progress';
      job.acceptedBidId = bid._id;
      await job.save();

      // Reject all other pending bids and notify those freelancers
      const rejectedBids = await Bid.find({
        jobId: bid.jobId,
        _id: { $ne: bid._id },
        status: 'pending'
      });

      await Bid.updateMany(
        { jobId: bid.jobId, _id: { $ne: bid._id }, status: 'pending' },
        { status: 'rejected' }
      );

      // Notify rejected freelancers (fire-and-forget)
      rejectedBids.forEach((rb) => {
        notify(io, {
          userId: rb.freelancerId,
          type: 'bid_rejected',
          message: `Your bid on "${job.title}" was not selected.`,
          link: `/jobs/${job._id}`
        });
      });

      // Notify the accepted freelancer
      await notify(io, {
        userId: bid.freelancerId,
        type: 'bid_accepted',
        message: `Congratulations! Your bid of $${bid.quoteAmount} on "${job.title}" was accepted.`,
        link: `/jobs/${job._id}`
      });

      // Send acceptance email (populate freelancer details first)
      const freelancer = await User.findById(bid.freelancerId);
      if (freelancer) {
        sendBidAcceptedEmail(freelancer, job, bid).catch(() => {});
      }
    } else {
      // Notify freelancer their bid was rejected
      await notify(io, {
        userId: bid.freelancerId,
        type: 'bid_rejected',
        message: `Your bid on "${job.title}" was not selected.`,
        link: `/jobs/${job._id}`
      });
    }

    await bid.save();

    const populated = await Bid.findById(bid._id).populate('freelancerId', 'name email rating profilePhotoUrl');
    res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bids submitted by the authenticated freelancer
// @route   GET /api/bids/my-bids
// @access  Private/Freelancer
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.id })
      .populate({
        path: 'jobId',
        populate: { path: 'clientId', select: 'name email rating' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
