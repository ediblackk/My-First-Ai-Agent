import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    credits: {
        type: Number,
        default: 100
    },
    totalWishes: {
        type: Number,
        default: 0
    },
    fulfilledWishes: {
        type: Number,
        default: 0
    },
    lastWishAt: {
        type: Date
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        }
    },
    stats: {
        wishesCreated: {
            type: Number,
            default: 0
        },
        wishesGranted: {
            type: Number,
            default: 0
        },
        totalCreditsSpent: {
            type: Number,
            default: 0
        },
        totalRewardsEarned: {
            type: Number,
            default: 0
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware pentru actualizarea lastActive
userSchema.pre('save', function(next) {
    this.lastActive = new Date();
    next();
});

// Metode pentru verificarea și actualizarea creditelor
userSchema.methods.hasEnoughCredits = function(amount) {
    return this.credits >= amount;
};

userSchema.methods.spendCredits = async function(amount) {
    if (!this.hasEnoughCredits(amount)) {
        throw new Error('Insufficient credits');
    }
    this.credits -= amount;
    this.stats.totalCreditsSpent += amount;
    await this.save();
};

userSchema.methods.addCredits = async function(amount) {
    this.credits += amount;
    this.stats.totalRewardsEarned += amount;
    await this.save();
};

// Metode pentru statistici
userSchema.methods.updateWishStats = async function(wishStatus) {
    this.stats.wishesCreated += 1;
    if (wishStatus === 'fulfilled') {
        this.stats.wishesGranted += 1;
    }
    await this.save();
};

// Metode statice pentru administrare
userSchema.statics.findAdmins = function() {
    return this.find({ isAdmin: true });
};

userSchema.statics.makeAdmin = async function(userId) {
    return await this.findByIdAndUpdate(
        userId,
        { isAdmin: true },
        { new: true }
    );
};

userSchema.statics.removeAdmin = async function(userId) {
    return await this.findByIdAndUpdate(
        userId,
        { isAdmin: false },
        { new: true }
    );
};

const User = mongoose.model('User', userSchema);
export default User;
