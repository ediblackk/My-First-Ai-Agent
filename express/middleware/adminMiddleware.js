import jwt from 'jsonwebtoken';
import * as adminConfig from '../config/adminConfig.js';
import User from '../models/user.js';

// Verifică dacă utilizatorul este autentificat și este admin
export const isAdmin = async (req, res, next) => {
  try {
    // Verifică token-ul JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autentificare lipsă'
      });
    }

    // Decodează token-ul
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verifică dacă utilizatorul există
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilizator invalid'
      });
    }

    // Verifică dacă wallet-ul este în lista de admin
    if (!adminConfig.adminWallets.includes(user.publicKey)) {
      return res.status(403).json({
        success: false,
        error: 'Acces interzis'
      });
    }

    // Adaugă informațiile utilizatorului la request
    req.admin = {
      id: user._id,
      publicKey: user.publicKey,
      role: 'SUPER_ADMIN' // Temporar, până implementăm roluri în DB
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

// Verifică permisiunile specifice
export const hasPermission = (permission) => {
  return (req, res, next) => {
    try {
      // Verifică dacă utilizatorul are rol de admin
      if (!req.admin) {
        return res.status(403).json({
          success: false,
          error: 'Acces interzis'
        });
      }

      // Obține permisiunile pentru rolul utilizatorului
      const role = adminConfig.roles[req.admin.role];
      if (!role) {
        return res.status(403).json({
          success: false,
          error: 'Rol invalid'
        });
      }

      // Verifică dacă rolul are permisiunea necesară
      if (!role.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: 'Permisiune insuficientă'
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Eroare la verificarea permisiunilor'
      });
    }
  };
};

// Rate limiting pentru API admin
export const adminRateLimit = (req, res, next) => {
  // TODO: Implementare rate limiting
  next();
};

// Logging pentru acțiuni admin
export const auditLog = (action) => {
  return (req, res, next) => {
    if (adminConfig.logging.auditLog) {
      // Log acțiunea
      console.log('Admin audit:', {
        timestamp: new Date(),
        action,
        admin: req.admin.publicKey,
        ip: req.ip,
        method: req.method,
        path: req.path,
        body: req.body
      });
    }
    next();
  };
};
