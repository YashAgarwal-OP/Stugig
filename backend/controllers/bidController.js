const Bid = require('../models/Bid');
const Job = require('../models/Job');

// @desc    Submit a bid on a job
// @route   POST /api/jobs/:id/bid
// @access  Private/Freelancer
exports.createBid = async (req, res) => {
  try {
    const { quote, eta, message } = req.body;
    const jobId = req.params.id;

    // Check if the job exists and is open for bids
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ success: false, error: 'Job is not open for bidding' });
    }

    // Check if user is trying to bid on their own job
    if (job.client.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot bid on your own job' });
    }

    // Submit bid
    const bid = await Bid.create({
      job: jobId,
      freelancer: req.user.id,
      quote: Number(quote),
      eta,
      message
    });

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
