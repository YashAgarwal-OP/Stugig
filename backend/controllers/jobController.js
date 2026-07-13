const Job = require('../models/Job');

// @desc    Create a new job post
// @route   POST /api/jobs/new
// @access  Private/Client
exports.createJob = async (req, res) => {
  try {
    const { title, description, budget, deadline, category } = req.body;

    // Build job object
    const job = await Job.create({
      client: req.user.id,
      title,
      description,
      budget: Number(budget),
      deadline: new Date(deadline),
      category
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all active/open jobs
// @route   GET /api/jobs
// @access  Private
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('client', 'name email rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
