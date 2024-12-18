const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateUniqueId } = require('../utils/helpers');
const solanaWeb3 = require('@solana/web3.js');

exports.authenticateUser = async (req, res) => {
  console.log('\n=== Authentication Request ===');
  console.log('Request body:', req.body);
  const { publicKey } = req.body;

  try {
    // Validate publicKey
    if (!publicKey) {
      console.error('Authentication failed: No publicKey provided');
      return res.status(400).json({
        success: false,
        error: 'Public key is required'
      });
    }

    // Validate publicKey format
    let validatedKey;
    try {
      validatedKey = new solanaWeb3.PublicKey(publicKey).toString();
      console.log('Validated publicKey:', validatedKey);
    } catch (error) {
      console.error('Authentication failed: Invalid publicKey format:', publicKey);
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format'
      });
    }

    console.log('Looking for existing user with publicKey:', validatedKey);
    // Find user by public key
    let user = await User.findOne({ publicKey: validatedKey });
    console.log('Existing user found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Creating new user with publicKey:', validatedKey);
      // Create new user
      user = new User({
        publicKey: validatedKey,
        credits: 0,
        pendingCredits: 0,
        activeWishes: 0,
        totalWishes: 0
      });

      try {
        await user.save();
        console.log('New user created successfully:', user._id);
      } catch (saveError) {
        console.error('Error saving new user:', {
          error: saveError,
          publicKey: validatedKey,
          errorName: saveError.name,
          errorCode: saveError.code,
          errorMessage: saveError.message
        });

        // If it's a duplicate key error, try to find the existing user
        if (saveError.code === 11000) {
          console.log('Duplicate key error, trying to find existing user');
          user = await User.findOne({ publicKey: validatedKey });
          if (!user) {
            return res.status(400).json({
              success: false,
              error: 'Error creating user account'
            });
          }
          console.log('Found existing user:', user._id);
        } else {
          throw saveError;
        }
      }
    }

    // Generate JWT token for session
    const token = generateJWTToken(user);
    console.log('JWT token generated for user:', user._id);

    const response = {
      success: true,
      user: {
        id: user._id,
        publicKey: user.publicKey,
        credits: user.credits,
        pendingCredits: user.pendingCredits,
        activeWishes: user.activeWishes,
        totalWishes: user.totalWishes
      },
      token
    };
    console.log('Sending response:', response);

    res.json(response);
  } catch (error) {
    console.error('Authentication error:', {
      error,
      publicKey,
      errorName: error.name,
      errorMessage: error.message
    });

    res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'development' 
        ? `Authentication error: ${error.message}`
        : 'Authentication error'
    });
  }
};

exports.getCredits = async (req, res) => {
  try {
    console.log('Fetching credits for user:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      credits: user.credits,
      pendingCredits: user.pendingCredits
    });
  } catch (error) {
    console.error('Error fetching credits:', {
      error,
      userId: req.user.id,
      errorMessage: error.message
    });

    res.status(500).json({ 
      success: false, 
      error: 'Error fetching credits' 
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    console.log('Fetching stats for user:', req.user.id);
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      stats: {
        credits: user.credits,
        pendingCredits: user.pendingCredits,
        activeWishes: user.activeWishes,
        totalWishes: user.totalWishes,
        lastWishAt: user.lastWishAt
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', {
      error,
      userId: req.user.id,
      errorMessage: error.message
    });

    res.status(500).json({ 
      success: false, 
      error: 'Error fetching user stats' 
    });
  }
};

function generateJWTToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      publicKey: user.publicKey
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};
