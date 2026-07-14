const Job = require('../models/Job');
const Bid = require('../models/Bid');
const notify = require('../utils/notify');

// @desc    Create a new job post
// @route   POST /api/jobs
// @access  Private/Client
exports.createJob = async (req, res) => {
  try {
    const { title, description, category, budgetMin, budgetMax, deadline, skillsRequired } = req.body;

    const job = await Job.create({
      clientId: req.user.id,
      title,
      description,
      category,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      deadline: new Date(deadline),
      skillsRequired: skillsRequired || [],
      status: 'open'
    });

    const populated = await Job.findById(job._id).populate('clientId', 'name email rating');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all open jobs with search, category filter, budget filter and pagination
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, category, minBudget, maxBudget, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Status filter — default to open for public browse
    if (status) {
      query.status = status;
    } else {
      query.status = 'open';
    }

    // Search — regex is index-independent and avoids MongoServerError on fresh DBs
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      query.budgetMax = {};
      if (minBudget) query.budgetMax.$gte = Number(minBudget);
      if (maxBudget) query.budgetMin = { ...query.budgetMin, $lte: Number(maxBudget) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const pages = Math.ceil(total / Number(limit));

    const jobs = await Job.find(query)
      .populate('clientId', 'name email rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ jobs, total, page: Number(page), pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('clientId', 'name email rating profilePhotoUrl');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all jobs posted by the authenticated client
// @route   GET /api/jobs/client/my-jobs
// @access  Private/Client
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user.id })
      .populate('clientId', 'name email rating')
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update job status (in-progress, completed, closed)
// @route   PUT /api/jobs/:id/status
// @access  Private/Client or Admin
exports.updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['open', 'in-progress', 'completed', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Admins can update any job; clients can only update their own
    const isAdmin = req.user.role === 'admin';
    const isOwner = job.clientId.toString() === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const previousStatus = job.status;
    job.status = status;
    await job.save();

    // Notify the accepted freelancer when the job is marked complete
    if (status === 'completed' && previousStatus !== 'completed' && job.acceptedBidId) {
      try {
        const acceptedBid = await Bid.findById(job.acceptedBidId);
        if (acceptedBid) {
          const io = req.app.locals.io;
          await notify(io, {
            userId: acceptedBid.freelancerId,
            type: 'job_completed',
            message: `The job "${job.title}" has been marked as complete. You can now request your review!`,
            link: `/jobs/${job._id}`
          });
        }
      } catch (notifyErr) {
        console.warn('[JobStatus] Notification failed (non-fatal):', notifyErr.message);
      }
    }

    const updated = await Job.findById(job._id).populate('clientId', 'name email rating');
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
