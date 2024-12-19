import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log('\n=== Auth Middleware ===');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ 
        success: false,
        error: 'Token de autentificare lipsă' 
      });
    }

    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('User not found:', decoded.id);
      return res.status(404).json({ 
        success: false,
        error: 'Utilizator negăsit' 
      });
    }

    // Verify wallet address matches
    if (user.walletAddress !== decoded.walletAddress) {
      console.error('Wallet address mismatch:', {
        userWallet: user.walletAddress,
        tokenWallet: decoded.walletAddress
      });
      return res.status(401).json({ 
        success: false,
        error: 'Token invalid' 
      });
    }

    // Verify admin status matches
    if (user.isAdmin !== decoded.isAdmin) {
      console.error('Admin status mismatch:', {
        userIsAdmin: user.isAdmin,
        tokenIsAdmin: decoded.isAdmin
      });
      return res.status(401).json({ 
        success: false,
        error: 'Token invalid' 
      });
    }

    // Attach decoded token data and user to request
    req.user = user;
    req.token = decoded;

    console.log('Auth successful:', {
      userId: user._id,
      walletAddress: user.walletAddress,
      isAdmin: user.isAdmin,
      role: decoded.role,
      permissions: decoded.permissions
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token:', error);
      return res.status(401).json({ 
        success: false,
        error: 'Token invalid' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired:', error);
      return res.status(401).json({ 
        success: false,
        error: 'Token expirat' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Eroare de autentificare' 
    });
  }
};
