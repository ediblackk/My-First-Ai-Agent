import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';

// Funcție pentru verificare admin
const isAdminWallet = (walletAddress) => {
  const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim()) || [];
  return adminWallets.includes(walletAddress);
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
  const { publicKey } = req.body;

  try {
    // Validate publicKey
    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: 'Public key is required'
      });
    }

    // Validate publicKey format
    let walletAddress;
    try {
      walletAddress = new PublicKey(publicKey).toString();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid public key format'
      });
    }

    // Verifică dacă wallet-ul este în lista de admin-i
    const isAdmin = isAdminWallet(walletAddress);

    // Find user by wallet address
    let user = await User.findOne({ walletAddress });

    if (!user) {
      // Create new user
      user = new User({
        username: `user_${walletAddress.substring(0, 8)}`,
        walletAddress,
        credits: parseInt(process.env.DEFAULT_CREDITS || '100'),
        isAdmin
      });

      try {
        await user.save();
      } catch (saveError) {
        // If it's a duplicate key error, try to find the existing user
        if (saveError.code === 11000) {
          user = await User.findOne({ walletAddress });
          if (!user) {
            return res.status(400).json({
              success: false,
              error: 'Error creating user account'
            });
          }
        } else {
          throw saveError;
        }
      }
    } else {
      // Update isAdmin status if it changed
      if (user.isAdmin !== isAdmin) {
        user.isAdmin = isAdmin;
        await user.save();
      }
    }

    // Generate JWT token for session
    const token = generateJWTToken(user);

    res.json({
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
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error'
    });
  }
};

export const getCredits = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
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
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching credits' 
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
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
    res.status(500).json({
      success: false,
      error: 'Error adding credits'
    });
  }
};
