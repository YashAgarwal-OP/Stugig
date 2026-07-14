const express = require('express');
const {
  getMyPortfolio,
  getPortfolioByUser,
  addPortfolioItem,
  deletePortfolioItem
} = require('../controllers/portfolioController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPortfolioImage } = require('../middleware/upload');

const router = express.Router();

// user/:userId must be before /:id
router.get('/user/:userId', getPortfolioByUser);
router.get('/', protect, authorize('freelancer'), getMyPortfolio);
router.post('/', protect, authorize('freelancer'), uploadPortfolioImage, addPortfolioItem);
router.delete('/:id', protect, authorize('freelancer'), deletePortfolioItem);

module.exports = router;
