const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  // GeoJSON location derived from address.coordinates (lng, lat)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
      default: undefined
    }
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    }
  },
  images: [{
    type: String
  }],
  categories: [{
    type: String,
    enum: ['men', 'women', 'kids', 'accessories', 'footwear', 'jewelry', 'bags'],
    lowercase: true,
    trim: true
  }],
  brands: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  deliveryOptions: {
    pickup: {
      type: Boolean,
      default: true
    },
    delivery: {
      type: Boolean,
      default: true
    },
    deliveryRadius: {
      type: Number,
      default: 10 // in kilometers
    },
    deliveryFee: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep 2dsphere index on GeoJSON location
storeSchema.index({ location: '2dsphere' });

// Derive GeoJSON location from address.coordinates before save
storeSchema.pre('save', function(next) {
  if (this.address?.coordinates) {
    const { lat, lng } = this.address.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      this.location = { type: 'Point', coordinates: [lng, lat] };
    }
  }
  next();
});

// Update location on findOneAndUpdate if coordinates provided
storeSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  const coord = update?.address?.coordinates;
  if (coord && typeof coord.lat !== 'undefined' && typeof coord.lng !== 'undefined') {
    const lat = parseFloat(coord.lat);
    const lng = parseFloat(coord.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      this.setUpdate({
        ...update,
        location: { type: 'Point', coordinates: [lng, lat] }
      });
    }
  }
  next();
});

module.exports = mongoose.model('Store', storeSchema);



