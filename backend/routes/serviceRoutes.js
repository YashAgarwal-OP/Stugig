const express = require('express');
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadServiceImage } = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('freelancer'), uploadServiceImage, createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, authorize('freelancer'), uploadServiceImage, updateService)
  .delete(protect, authorize('freelancer'), deleteService);

module.exports = router;
