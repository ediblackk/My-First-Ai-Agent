const mongoose = require('mongoose');

const RoundSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fast', 'daily'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
    index: true
  },
  requiredWishes: {
    type: Number,
    required: true,
    min: 1
  },
  currentWishes: {
    type: Number,
    default: 0,
    min: 0
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  fulfilledWishes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wish'
  }],
  totalRewardsDistributed: {
    type: Number,
    default: 0
  },
  nextRoundRequiredWishes: {
    type: Number,
    default: null
  },
  aiProcessingStarted: {
    type: Date,
    default: null
  },
  aiProcessingCompleted: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
RoundSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If status is changing to active, set startTime
  if (this.isModified('status')) {
    if (this.status === 'active' && !this.startTime) {
      this.startTime = new Date();
    } else if (this.status === 'completed' && !this.endTime) {
      this.endTime = new Date();
    }
  }
  
  next();
});

// Virtual for duration
RoundSchema.virtual('duration').get(function() {
  if (!this.startTime) return null;
  const end = this.endTime || new Date();
  return end - this.startTime;
});

// Virtual for progress percentage
RoundSchema.virtual('progress').get(function() {
  return Math.min(Math.round((this.currentWishes / this.requiredWishes) * 100), 100);
});

// Add compound indexes
RoundSchema.index({ type: 1, status: 1 });
RoundSchema.index({ status: 1, createdAt: -1 });

// Methods
RoundSchema.methods.isReadyToStart = function() {
  return this.status === 'pending' && this.currentWishes >= this.requiredWishes;
};

RoundSchema.methods.canAddWish = function() {
  return ['pending', 'active'].includes(this.status);
};

RoundSchema.statics.findCurrentRound = function() {
  return this.findOne({
    status: { $in: ['pending', 'active'] }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Round', RoundSchema);
