const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, requireRole } = require('../middleware/auth');

router.route('/')
  .get(getServices)
  .post(protect, requireRole('freelancer'), createService);

router.route('/:id')
  .get(getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
