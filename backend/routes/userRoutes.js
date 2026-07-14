const express = require('express');
const { getUserById, getUsers, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfilePhoto } = require('../middleware/upload');

const router = express.Router();

// profile route must be registered before /:id to avoid collision
router.put('/profile', protect, uploadProfilePhoto, updateProfile);

router.get('/', getUsers);
router.get('/:id', getUserById);

module.exports = router;
