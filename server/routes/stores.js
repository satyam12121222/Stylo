const express = require('express');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all stores
router.get('/', async (req, res) => {
  try {
    const { category, lat, lng, radius = 10, sort = 'rating.average', order = 'desc' } = req.query;

    const filter = { isActive: true };

    if (category) filter.categories = category;

    let stores;
    if (lat && lng) {
      // Find stores within radius
      stores = await Store.find({
        ...filter,
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      }).sort({ [sort]: order === 'desc' ? -1 : 1 });
    } else {
      stores = await Store.find(filter).sort({ [sort]: order === 'desc' ? -1 : 1 });
    }

    res.json(stores);
  } catch (error) {
    console.error('Stores fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store by ID
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Store fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create store (store owner only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      contact,
      categories,
      brands,
      operatingHours,
      deliveryOptions
    } = req.body;

    const store = new Store({
      name,
      description,
      owner: req.user.userId,
      address,
      contact,
      categories,
      brands,
      operatingHours,
      deliveryOptions
    });

    await store.save();

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update store
router.put('/:id', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user owns the store
    if (store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: 'Store updated successfully',
      store: updatedStore
    });
  } catch (error) {
    console.error('Store update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user owns the store
    if (store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get product count
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ store: req.params.id });

    // Get order count
    const Order = require('../models/Order');
    const orderCount = await Order.countDocuments({ store: req.params.id });

    res.json({
      productCount,
      orderCount,
      rating: store.rating
    });
  } catch (error) {
    console.error('Store stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


