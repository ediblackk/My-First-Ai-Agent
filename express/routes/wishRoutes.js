const express = require('express');
const router = express.Router();
const { 
  createWish, 
  getUserWishes, 
  getCurrentRound,
  fulfillWishes 
} = require('../controllers/wishController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateApiKey } = require('../middleware/apiKeyMiddleware');

// Public routes
router.get('/current-round', getCurrentRound);

// Protected routes (require authentication)
router.post('/create', authMiddleware, createWish);
router.get('/my-wishes', authMiddleware, getUserWishes);

// AI Service route (protected with API key)
router.post('/fulfill', validateApiKey, fulfillWishes);

module.exports = router;
