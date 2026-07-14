const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Get all reviews for a user (as the reviewee)
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name profilePhotoUrl')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a review for another user after job completion
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const {
      jobId,
      revieweeId,
      // Accept either a single rating or three sub-ratings from the modal
      rating: rawRating,
      communicationRating,
      qualityRating,
      timelinessRating,
      comment
    } = req.body;

    if (!jobId || !revieweeId) {
      return res.status(400).json({ message: 'jobId and revieweeId are required' });
    }

    // Compute final rating: average of sub-ratings when provided, otherwise use rawRating
    let finalRating;
    if (communicationRating && qualityRating && timelinessRating) {
      finalRating = Math.round(
        (Number(communicationRating) + Number(qualityRating) + Number(timelinessRating)) / 3
      );
    } else if (rawRating) {
      finalRating = Number(rawRating);
    } else {
      return res.status(400).json({ message: 'A rating is required (either rating or all three sub-ratings)' });
    }

    if (finalRating < 1 || finalRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify the job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be left after a job is completed' });
    }

    // Prevent self-review
    if (req.user.id === revieweeId) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check for duplicate review
    const existing = await Review.findOne({ jobId, reviewerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a review for this job' });
    }

    const review = await Review.create({
      jobId,
      reviewerId: req.user.id,
      revieweeId,
      rating: finalRating,
      comment: comment || ''
    });

    // Recalculate the reviewee's average rating
    const allReviews = await Review.find({ revieweeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length
    });

    const populated = await Review.findById(review._id)
      .populate('reviewerId', 'name profilePhotoUrl')
      .populate('jobId', 'title');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
