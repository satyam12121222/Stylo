const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_key');
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Payment processing error' });
  }
});

// Confirm payment
router.post('/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order payment status
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'completed'
      });

      res.json({
        message: 'Payment confirmed successfully',
        paymentStatus: 'completed'
      });
    } else {
      res.status(400).json({
        message: 'Payment failed',
        paymentStatus: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Payment confirmation error' });
  }
});

// Get payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    // In a real app, you'd store customer IDs and retrieve saved payment methods
    res.json({
      methods: [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'upi', name: 'UPI', icon: '📱' },
        { id: 'wallet', name: 'Digital Wallet', icon: '👛' },
        { id: 'cash', name: 'Cash on Delivery', icon: '💰' }
      ]
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process UPI payment
router.post('/upi', auth, async (req, res) => {
  try {
    const { upiId, amount, orderId } = req.body;

    // Simulate UPI payment processing
    // In real app, integrate with UPI payment gateway
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (paymentSuccess) {
      // Update order payment status
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'completed'
      });

      res.json({
        message: 'UPI payment successful',
        paymentStatus: 'completed',
        transactionId: `UPI_${Date.now()}`
      });
    } else {
      res.status(400).json({
        message: 'UPI payment failed',
        paymentStatus: 'failed'
      });
    }
  } catch (error) {
    console.error('UPI payment error:', error);
    res.status(500).json({ message: 'UPI payment error' });
  }
});

// Process wallet payment
router.post('/wallet', auth, async (req, res) => {
  try {
    const { walletType, amount, orderId } = req.body;

    // Simulate wallet payment processing
    // In real app, integrate with wallet APIs
    const paymentSuccess = Math.random() > 0.05; // 95% success rate

    if (paymentSuccess) {
      // Update order payment status
      const Order = require('../models/Order');
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'completed'
      });

      res.json({
        message: 'Wallet payment successful',
        paymentStatus: 'completed',
        transactionId: `${walletType.toUpperCase()}_${Date.now()}`
      });
    } else {
      res.status(400).json({
        message: 'Wallet payment failed',
        paymentStatus: 'failed'
      });
    }
  } catch (error) {
    console.error('Wallet payment error:', error);
    res.status(500).json({ message: 'Wallet payment error' });
  }
});

// Cash on delivery confirmation
router.post('/cod', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Update order payment status
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'pending',
      orderStatus: 'confirmed'
    });

    res.json({
      message: 'Order confirmed for cash on delivery',
      paymentStatus: 'pending'
    });
  } catch (error) {
    console.error('COD confirmation error:', error);
    res.status(500).json({ message: 'COD confirmation error' });
  }
});

module.exports = router;



