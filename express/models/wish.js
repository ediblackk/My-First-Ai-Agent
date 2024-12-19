import mongoose from 'mongoose';

// Schema pentru analiza AI
const AnalysisSchema = new mongoose.Schema({
  complexity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  categories: [{
    type: String,
    required: true
  }],
  challenges: [{
    type: String,
    required: true
  }],
  suggestions: [{
    type: String,
    required: true
  }],
  resources: {
    timeEstimate: String,
    skillsRequired: [String],
    toolsNeeded: [String]
  }
}, { _id: false });

// Schema pentru pașii soluției
const SolutionStepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timeEstimate: String,
  dependencies: [String]
}, { _id: false });

// Schema pentru riscuri
const RiskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  mitigation: {
    type: String,
    required: true
  }
}, { _id: false });

// Schema pentru soluția AI
const SolutionSchema = new mongoose.Schema({
  steps: [SolutionStepSchema],
  timeline: {
    type: String,
    required: true
  },
  resources: [String],
  risks: [RiskSchema],
  successCriteria: [String]
}, { _id: false });

// Schema pentru tokens folosiți
const TokensUsedSchema = new mongoose.Schema({
  analysis: {
    type: Number,
    default: 0,
    min: 0
  },
  solution: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

// Schema principală pentru dorințe
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
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1
  },
  analysis: {
    type: AnalysisSchema,
    required: true
  },
  solution: {
    type: SolutionSchema,
    required: true
  },
  aiModel: {
    type: String,
    required: true,
    default: 'openai/gpt-4'
  },
  tokensUsed: {
    type: TokensUsedSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
});

// Middleware pre-save pentru actualizare timestamp
WishSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Actualizare timestamps pentru status changes
  if (this.isModified('status')) {
    if (this.status === 'completed') {
      this.completedAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }
  
  next();
});

// Metode statice
WishSchema.statics.getActiveWishesCount = function(userId) {
  return this.countDocuments({
    user: userId,
    status: 'pending'
  });
};

WishSchema.statics.getTotalWishesCount = function(userId) {
  return this.countDocuments({
    user: userId
  });
};

// Metode de instanță
WishSchema.methods.updateStatus = async function(newStatus) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Actualizare user stats
  if (oldStatus !== newStatus) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    
    if (oldStatus === 'pending' && newStatus === 'completed') {
      user.activeWishes -= 1;
    } else if (oldStatus === 'completed' && newStatus === 'pending') {
      user.activeWishes += 1;
    }
    
    await user.save();
  }
  
  return this.save();
};

WishSchema.methods.addTokensUsed = function(type, count) {
  if (!this.tokensUsed) {
    this.tokensUsed = {};
  }
  this.tokensUsed[type] = (this.tokensUsed[type] || 0) + count;
  return this.save();
};

// Virtual pentru total tokens
WishSchema.virtual('totalTokensUsed').get(function() {
  if (!this.tokensUsed) return 0;
  return (this.tokensUsed.analysis || 0) + (this.tokensUsed.solution || 0);
});

// Indexuri
WishSchema.index({ user: 1, status: 1 });
WishSchema.index({ createdAt: -1 });
WishSchema.index({ 'analysis.complexity': 1 });
WishSchema.index({ credits: 1 });

const Wish = mongoose.model('Wish', WishSchema);
export default Wish;
