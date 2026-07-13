const Review = require('../models/Review');
const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { jobId, revieweeId, communicationRating, qualityRating, timelinessRating, comment } = req.body;

    if (!jobId || !revieweeId || !communicationRating || !qualityRating || !timelinessRating) {
      return res.status(400).json({ message: 'All rating fields are required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Overall rating is average of communication, quality, and timeliness
    const overallRating = Math.round((communicationRating + qualityRating + timelinessRating) / 3);

    const review = new Review({
      jobId,
      reviewerId: req.user._id,
      revieweeId,
      communicationRating,
      qualityRating,
      timelinessRating,
      overallRating,
      comment,
    });

    await review.save();

    // Re-calculate the average rating for the reviewee (User)
    const reviews = await Review.find({ revieweeId });
    const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avgRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(revieweeId, { rating: avgRating });

    res.status(201).json(review);
  } catch (error) {
    console.error('createReview Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name avatarUrl')
      .sort('-createdAt');

    // Map DB fields to what frontend ReviewListItem expects:
    // rating -> overallRating, text -> comment
    const mappedReviews = reviews.map(r => ({
      _id: r._id,
      reviewerId: r.reviewerId,
      rating: r.overallRating,
      text: r.comment,
      createdAt: r.createdAt
    }));

    res.json(mappedReviews);
  } catch (error) {
    console.error('getUserReviews Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
};
