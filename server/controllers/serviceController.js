const Service = require('../models/Service');

// @desc    Get all services (with filters and pagination)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, minRating, freelancerId, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (freelancerId) query.freelancerId = freelancerId;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (minRating) query.rating = { $gte: Number(minRating) };

    const skip = (Number(page) - 1) * Number(limit);

    const services = await Service.find(query)
      .populate('freelancerId', 'name avatarUrl rating')
      .skip(skip)
      .limit(Number(limit));

    const total = await Service.countDocuments(query);

    res.json({
      services,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    console.error('getServices Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancerId', 'name avatarUrl rating bio skills');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(service);
  } catch (error) {
    console.error('getServiceById Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Freelancer)
const createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, images } = req.body;

    if (!title || !description || !category || !price || !deliveryTime) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const service = new Service({
      freelancerId: req.user._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      images: images || [],
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    console.error('createService Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Owner)
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check ownership
    if (service.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this service' });
    }

    // Only allow explicit fields – never let req.body overwrite freelancerId or status
    const { title, description, category, price, deliveryTime, images } = req.body;
    const allowedUpdates = {};
    if (title !== undefined) allowedUpdates.title = title;
    if (description !== undefined) allowedUpdates.description = description;
    if (category !== undefined) allowedUpdates.category = category;
    if (price !== undefined) allowedUpdates.price = price;
    if (deliveryTime !== undefined) allowedUpdates.deliveryTime = deliveryTime;
    if (images !== undefined) allowedUpdates.images = images;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.json(updatedService);
  } catch (error) {
    console.error('updateService Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private (Owner)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check ownership
    if (service.freelancerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this service' });
    }

    await Service.deleteOne({ _id: req.params.id });
    res.json({ message: 'Service removed' });
  } catch (error) {
    console.error('deleteService Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
