const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/authenticate', userController.authenticateUser);

// Protected routes (require authentication)
router.get('/credits', authMiddleware, userController.getCredits);
router.get('/stats', authMiddleware, userController.getUserStats);

module.exports = router;
