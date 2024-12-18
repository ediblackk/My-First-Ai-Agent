const mongoose = require('mongoose');

const WishSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  creditsCost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'rejected'],
    default: 'pending',
    index: true
  },
  roundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Round',
    required: true,
    index: true
  },
  fulfillmentDetails: {
    rewardAmount: {
      type: Number,
      default: null
    },
    fulfillmentMessage: {
      type: String,
      default: null
    },
    transactionHash: {
      type: String,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  fulfilledAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
WishSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If status is changing to fulfilled, set fulfilledAt
  if (this.isModified('status') && this.status === 'fulfilled' && !this.fulfilledAt) {
    this.fulfilledAt = new Date();
  }
  
  next();
});

// Calculate credits cost based on wish length
WishSchema.pre('save', function(next) {
  if (this.isNew) {
    const length = this.content.length;
    let cost = 0;

    if (length <= 50) {
      cost = Math.floor(length / 10);
    } else if (length <= 100) {
      cost = 5 + Math.floor((length - 50) / 10) * 2;
    } else if (length <= 200) {
      cost = 15 + Math.floor((length - 100) / 10) * 3;
    } else {
      cost = 45 + Math.floor((length - 200) / 10) * 5;
    }

    this.creditsCost = cost;
  }
  next();
});

// Add compound indexes
WishSchema.index({ status: 1, createdAt: -1 });
WishSchema.index({ roundId: 1, status: 1 });
WishSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Wish', WishSchema);
