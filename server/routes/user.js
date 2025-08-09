const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('preferences');
    res.json(user.preferences);
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.userId);
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('address');
    res.json([user.address]); // Return as array for consistency
  } catch (error) {
    console.error('Addresses fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user address
router.put('/address', auth, async (req, res) => {
  try {
    const { address } = req.body;
    
    const user = await User.findById(req.user.userId);
    user.address = address;
    await user.save();

    res.json({
      message: 'Address updated successfully',
      address: user.address
    });
  } catch (error) {
    console.error('Address update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user favorites
router.get('/favorites', auth, async (req, res) => {
  try {
    // In a real app, you'd have a separate Favorites model
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to favorites
router.post('/favorites/:productId', auth, async (req, res) => {
  try {
    // In a real app, you'd add to Favorites collection
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from favorites
router.delete('/favorites/:productId', auth, async (req, res) => {
  try {
    // In a real app, you'd remove from Favorites collection
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



