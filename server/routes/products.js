const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// Configure Cloudinary (env vars must be set in production)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage to pass buffers to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      store,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (store) filter.store = store;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .populate('store', 'name address')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('store', 'name address')
      .limit(10);

    res.json(products);
  } catch (error) {
    console.error('Featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('store', 'name address contact rating')
      .populate('reviews.user', 'name profilePicture');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by store
router.get('/store/:storeId', async (req, res) => {
  try {
    const { category, sort = 'createdAt', order = 'desc' } = req.query;
    
    const filter = { store: req.params.storeId, isActive: true };
    if (category) filter.category = category;

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('store', 'name address')
      .sort(sortObj);

    res.json(products);
  } catch (error) {
    console.error('Store products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.user.userId,
      rating,
      comment
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.json({ message: 'Review added successfully', product });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby products
router.get('/nearby/products', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location coordinates required' });
    }

    // Find stores within radius
    const stores = await Store.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      },
      isActive: true
    });

    const storeIds = stores.map(store => store._id);

    // Get products from nearby stores
    const products = await Product.find({
      store: { $in: storeIds },
      isActive: true
    })
    .populate('store', 'name address')
    .limit(20);

    res.json(products);
  } catch (error) {
    console.error('Nearby products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (store owner only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      brand,
      price,
      originalPrice,
      discount,
      images,
      sizes,
      colors,
      specifications,
      tags,
      isFeatured
    } = req.body;

    // Find user's store
    const store = await Store.findOne({ owner: req.user.userId });
    if (!store) {
      return res.status(400).json({ message: 'You must have a registered store to add products' });
    }

    const product = new Product({
      name,
      description,
      store: store._id,
      category,
      subcategory,
      brand,
      price,
      originalPrice,
      discount,
      images: images || [],
      sizes: sizes || [],
      colors: colors || [],
      specifications: specifications || {},
      tags: tags || [],
      isFeatured: isFeatured || false
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (store owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the store
    if (product.store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('store', 'name address');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (store owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the store
    if (product.store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload product images
router.post('/upload-images', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // If Cloudinary not configured, return error to avoid silent failure in PaaS
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: 'Image service not configured' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'stylo-products'
      });
      imageUrls.push(result.secure_url);
    }

    res.json({
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

