const Portfolio = require('../models/Portfolio');

// @desc    Get the authenticated freelancer's portfolio items
// @route   GET /api/portfolio
// @access  Private/Freelancer
exports.getMyPortfolio = async (req, res) => {
  try {
    const items = await Portfolio.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a user's public portfolio by userId
// @route   GET /api/portfolio/user/:userId
// @access  Public
exports.getPortfolioByUser = async (req, res) => {
  try {
    const items = await Portfolio.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a portfolio item
// @route   POST /api/portfolio
// @access  Private/Freelancer
exports.addPortfolioItem = async (req, res) => {
  try {
    const { title, description, projectUrl } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'title and description are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'An image file is required' });
    }

    const item = await Portfolio.create({
      userId: req.user.id,
      title,
      description,
      projectUrl: projectUrl || '',
      imageUrl: `/uploads/portfolio/${req.file.filename}`
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a portfolio item
// @route   DELETE /api/portfolio/:id
// @access  Private/Freelancer
exports.deletePortfolioItem = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Portfolio item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
