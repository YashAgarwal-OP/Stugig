const Service = require('../models/Service');

// @desc    Get all active services with search, category, price filters and pagination
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, minRating, freelancerId, page = 1, limit = 8 } = req.query;

    const query = { status: 'active' };

    if (freelancerId) query.freelancerId = freelancerId;

    if (search) {
      // Use regex search as a resilient fallback — works without a text index
      // and avoids MongoServerError if the index hasn't been built yet.
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Service.countDocuments(query);
    const pages = Math.ceil(total / Number(limit));

    const services = await Service.find(query)
      .populate('freelancerId', 'name email rating profilePhotoUrl')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ services, total, page: Number(page), pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('freelancerId', 'name email rating profilePhotoUrl bio');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service listing
// @route   POST /api/services
// @access  Private/Freelancer
exports.createService = async (req, res) => {
  try {
    const { title, description, category, price, deliveryTime, tags } = req.body;

    if (!title || !description || !category || !price) {
      return res.status(400).json({ message: 'title, description, category, and price are required' });
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
        parsedTags = [];
      }
    }

    const service = await Service.create({
      freelancerId: req.user.id,
      title,
      description,
      category,
      price: Number(price),
      deliveryTime: deliveryTime || '3 days',
      tags: parsedTags,
      imageUrl: req.file ? `/uploads/services/${req.file.filename}` : ''
    });

    const populated = await Service.findById(service._id)
      .populate('freelancerId', 'name email rating profilePhotoUrl');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a service listing
// @route   PUT /api/services/:id
// @access  Private/Freelancer
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const allowedFields = ['title', 'description', 'category', 'price', 'deliveryTime', 'tags', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    });

    if (req.file) {
      service.imageUrl = `/uploads/services/${req.file.filename}`;
    }

    await service.save();
    const updated = await Service.findById(service._id).populate('freelancerId', 'name email rating profilePhotoUrl');
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a service listing
// @route   DELETE /api/services/:id
// @access  Private/Freelancer
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await service.deleteOne();
    res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
