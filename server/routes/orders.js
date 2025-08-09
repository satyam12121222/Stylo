const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const {
      store,
      items,
      deliveryAddress,
      deliveryType,
      deliveryInstructions,
      paymentMethod
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (let item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }
      item.price = product.price;
      subtotal += product.price * item.quantity;
    }

    const deliveryFee = deliveryType === 'delivery' ? 50 : 0; // Fixed delivery fee
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + deliveryFee + tax;

    const order = new Order({
      user: req.user.userId,
      store,
      items,
      deliveryAddress,
      deliveryType,
      deliveryInstructions,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { user: req.user.userId };
    if (status) filter.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('store', 'name address')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('store', 'name address contact')
      .populate('items.product', 'name images price brand');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is store owner
    if (order.user._id.toString() !== req.user.userId) {
      const Store = require('../models/Store');
      const store = await Store.findById(order.store);
      if (!store || store.owner.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (store owner only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the store
    const Store = require('../models/Store');
    const store = await Store.findById(order.store);
    if (!store || store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get store orders (store owner only)
router.get('/store/:storeId', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Check if user owns the store
    const Store = require('../models/Store');
    const store = await Store.findById(req.params.storeId);
    if (!store || store.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filter = { store: req.params.storeId };
    if (status) filter.orderStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Store orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



