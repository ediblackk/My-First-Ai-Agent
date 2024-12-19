import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';

// Funcție pentru verificare admin
const isAdminWallet = (publicKey) => {
  const adminWallets = process.env.ADMIN_WALLETS.split(',').map(w => w.trim());
  return adminWallets.includes(publicKey);
};

// Funcție pentru generare token JWT
const generateJWTToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

export const authenticateUser = async (req, res) => {
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
      validatedKey = new PublicKey(publicKey).toString();
      console.log('Validated publicKey:', validatedKey);
    } catch (error) {
      console.error('Authentication failed: Invalid publicKey format:', publicKey);
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format'
      });
    }

    // Verifică dacă wallet-ul este în lista de admin-i
    const isAdmin = isAdminWallet(validatedKey);
    console.log('Wallet is admin:', isAdmin);

    console.log('Looking for existing user with walletAddress:', validatedKey);
    // Find user by wallet address
    let user = await User.findOne({ walletAddress: validatedKey });
    console.log('Existing user found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Creating new user with walletAddress:', validatedKey);
      // Generate username from wallet address
      const username = `user_${validatedKey.substring(0, 8)}`;
      
      // Create new user
      user = new User({
        username,
        walletAddress: validatedKey,
        credits: parseInt(process.env.DEFAULT_CREDITS || '100'),
        isAdmin // Setăm isAdmin bazat pe lista din .env
      });

      try {
        await user.save();
        console.log('New user created successfully:', user._id);
      } catch (saveError) {
        console.error('Error saving new user:', {
          error: saveError,
          walletAddress: validatedKey,
          errorName: saveError.name,
          errorCode: saveError.code,
          errorMessage: saveError.message
        });

        // If it's a duplicate key error, try to find the existing user
        if (saveError.code === 11000) {
          console.log('Duplicate key error, trying to find existing user');
          user = await User.findOne({ walletAddress: validatedKey });
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
    } else {
      // Update isAdmin status if it changed
      if (user.isAdmin !== isAdmin) {
        user.isAdmin = isAdmin;
        await user.save();
        console.log('Updated user admin status:', isAdmin);
      }
    }

    // Generate JWT token for session
    const token = generateJWTToken(user);
    console.log('JWT token generated for user:', user._id);

    const response = {
      success: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        credits: user.credits,
        activeWishes: user.activeWishes || 0,
        totalWishes: user.totalWishes || 0,
        isAdmin: user.isAdmin
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

export const getCredits = async (req, res) => {
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
      credits: user.credits
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching credits' 
    });
  }
};

export const getUserStats = async (req, res) => {
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
        activeWishes: user.activeWishes || 0,
        totalWishes: user.totalWishes || 0,
        lastWishAt: user.lastWishAt,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching user stats' 
    });
  }
};

export const addCredits = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.credits += parseInt(amount);
    await user.save();

    res.json({
      success: true,
      credits: user.credits
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({
      success: false,
      error: 'Error adding credits'
    });
  }
};
