const Job = require('../models/Job');

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const { category, minBudget, maxBudget, status, sort = '-createdAt' } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    
    if (minBudget || maxBudget) {
      // Check budgetMin or budgetMax overlapping requested range, or simply checking budgetMin
      query.budgetMin = {};
      if (minBudget) query.budgetMin.$gte = Number(minBudget);
      // For max, you might want to check if budgetMax is less than the requested maxBudget
      if (maxBudget) query.budgetMax = { $lte: Number(maxBudget) };
    }

    const jobs = await Job.find(query)
      .populate('clientId', 'name avatarUrl rating')
      .sort(sort);

    res.json(jobs);
  } catch (error) {
    console.error('getJobs Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('clientId', 'name avatarUrl rating bio');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('getJobById Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Client)
const createJob = async (req, res) => {
  try {
    const { title, description, category, budgetMin, budgetMax, deadline, attachments, skillsRequired } = req.body;

    if (!title || !description || !category || !budgetMin || !budgetMax || !deadline) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const job = new Job({
      clientId: req.user._id,
      title,
      description,
      category,
      budgetMin,
      budgetMax,
      deadline,
      attachments: attachments || [],
      skillsRequired: skillsRequired || [],
      status: 'open'
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error('createJob Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update job status
// @route   PUT /api/jobs/:id/status
// @access  Private (Client/Owner or Admin)
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership (only the client who created the job or an admin can update status manually)
    if (job.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to update this job' });
    }

    job.status = status;
    const updatedJob = await job.save();

    res.json(updatedJob);
  } catch (error) {
    console.error('updateJobStatus Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get jobs created by the logged-in client
// @route   GET /api/jobs/client/my-jobs
// @access  Private (Client)
const getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id }).sort('-createdAt');
    res.json(jobs);
  } catch (error) {
    console.error('getClientJobs Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  getClientJobs,
};
