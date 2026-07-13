const express = require('express');
const { matchmaker } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/matchmaker', protect, matchmaker);

module.exports = router;
