import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Verifică dacă utilizatorul este autentificat și este admin
export const isAdmin = async (req, res, next) => {
  try {
    // Verifică dacă avem user și token de la authMiddleware
    if (!req.user || !req.token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autentificare lipsă'
      });
    }

    // Verifică dacă utilizatorul este admin
    if (!req.token.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acces interzis'
      });
    }

    // Adaugă informațiile utilizatorului la request
    req.admin = {
      id: req.user._id,
      walletAddress: req.user.walletAddress
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Autentificare eșuată'
    });
  }
};

// Logging pentru acțiuni admin
export const auditLog = (action) => {
  return (req, res, next) => {
    console.log('Admin audit:', {
      timestamp: new Date(),
      action,
      admin: req.admin.walletAddress,
      ip: req.ip,
      method: req.method,
      path: req.path,
      body: req.body
    });
    next();
  };
};
