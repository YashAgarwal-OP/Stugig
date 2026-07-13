const matchmakerService = require('../services/matchmakerService');
const biddingAssistantService = require('../services/biddingAssistantService');
const User = require('../models/User');

exports.getJobMatches = async (req, res) => {
  try {
    const user = req.user; // populated by protect middleware
    
    // We already check if user is freelancer in middleware, but just in case
    const matches = await matchmakerService.getJobMatchesForFreelancer(user._id, user.skills || []);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error matching jobs', error: error.message });
  }
};

exports.getBiddingSuggestions = async (req, res) => {
  try {
    const user = req.user; // populated by protect middleware
    
    const suggestions = await biddingAssistantService.generateBiddingSuggestions(req.params.jobId, user);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error generating suggestions', error: error.message });
  }
};
