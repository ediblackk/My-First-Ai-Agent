const mongoose = require('mongoose');
const solanaWeb3 = require('@solana/web3.js');

const UserSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: [true, 'Public key is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        try {
          if (!v) return false;
          const key = new solanaWeb3.PublicKey(v);
          return key.toString() === v;
        } catch (error) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid Solana public key`
    }
  },
  credits: {
    type: Number,
    default: 0,
    min: [0, 'Credits cannot be negative']
  },
  pendingCredits: {
    type: Number,
    default: 0,
    min: [0, 'Pending credits cannot be negative']
  },
  activeWishes: {
    type: Number,
    default: 0,
    min: [0, 'Active wishes cannot be negative']
  },
  totalWishes: {
    type: Number,
    default: 0,
    min: [0, 'Total wishes cannot be negative']
  },
  lastWishAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add index for createdAt
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
