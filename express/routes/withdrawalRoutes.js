const express = require('express');
const router = express.Router();
const { 
  requestWithdrawal, 
  completeWithdrawal, 
  getWithdrawalHistory 
} = require('../controllers/withdrawalController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes (require authentication)
router.post('/request', authMiddleware, requestWithdrawal);
router.post('/complete', authMiddleware, completeWithdrawal);
router.get('/history/:publicKey', authMiddleware, getWithdrawalHistory);

module.exports = router;
