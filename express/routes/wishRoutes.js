import express from 'express';
import { 
  createWish, 
  getUserWishes, 
  getCurrentRound,
  fulfillWishes 
} from '../controllers/wishController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateApiKey } from '../middleware/apiKeyMiddleware.js';

const router = express.Router();

// Public routes
router.get('/current-round', getCurrentRound);

// Protected routes (require authentication)
router.post('/create', authMiddleware, createWish);
router.get('/my-wishes', authMiddleware, getUserWishes);

// AI Service route (protected with API key)
router.post('/fulfill', validateApiKey, fulfillWishes);

export { router };
