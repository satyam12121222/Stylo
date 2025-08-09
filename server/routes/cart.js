const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// In-memory cart storage (in production, use Redis or database)
const carts = new Map();

// Get user cart
router.get('/', auth, (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = carts.get(userId) || [];
    
    res.json(userCart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, storeId, quantity, size, color } = req.body;
    const userId = req.user.userId;

    // Validate product exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is from the same store as existing items
    const userCart = carts.get(userId) || [];
    if (userCart.length > 0 && userCart[0].storeId !== storeId) {
      return res.status(400).json({ 
        message: 'Cannot add items from different stores. Please clear your cart first.' 
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = userCart.findIndex(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (existingItemIndex !== -1) {
      userCart[existingItemIndex].quantity += quantity;
    } else {
      userCart.push({
        productId,
        storeId,
        quantity,
        size,
        color,
        price: product.price,
        name: product.name,
        image: product.images[0]
      });
    }

    carts.set(userId, userCart);

    res.json({
      message: 'Item added to cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:productId', auth, (req, res) => {
  try {
    const { quantity, size, color } = req.body;
    const { productId } = req.params;
    const userId = req.user.userId;

    const userCart = carts.get(userId) || [];
    const itemIndex = userCart.findIndex(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      userCart.splice(itemIndex, 1);
    } else {
      userCart[itemIndex].quantity = quantity;
    }

    carts.set(userId, userCart);

    res.json({
      message: 'Cart updated successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;
    const userId = req.user.userId;

    const userCart = carts.get(userId) || [];
    const itemIndex = userCart.findIndex(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    userCart.splice(itemIndex, 1);
    carts.set(userId, userCart);

    res.json({
      message: 'Item removed from cart successfully',
      cart: userCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, (req, res) => {
  try {
    const userId = req.user.userId;
    carts.delete(userId);

    res.json({
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart summary
router.get('/summary', auth, (req, res) => {
  try {
    const userId = req.user.userId;
    const userCart = carts.get(userId) || [];

    const subtotal = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = userCart.length > 0 ? 50 : 0; // Fixed delivery fee
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + deliveryFee + tax;

    res.json({
      items: userCart,
      subtotal,
      deliveryFee,
      tax,
      total,
      itemCount: userCart.length
    });
  } catch (error) {
    console.error('Cart summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



