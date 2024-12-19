import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/authenticate', userController.authenticateUser);

// Protected routes (require authentication)
router.get('/credits', authMiddleware, userController.getCredits);
router.get('/stats', authMiddleware, userController.getUserStats);
router.post('/add-credits', authMiddleware, userController.addCredits);

export { router };
