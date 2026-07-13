const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);

// Example of a role-protected route (e.g. for testing)
router.get('/client-only', protect, requireRole('client'), (req, res) => {
  res.json({ message: 'Welcome client!' });
});

module.exports = router;
