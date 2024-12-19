import express from 'express';
import { createTransaction, validateTransfer, getTransactionStatus } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes require authentication
router.post('/create', authMiddleware, createTransaction);
router.post('/validate', authMiddleware, validateTransfer);
router.get('/status/:signature', authMiddleware, getTransactionStatus);

export { router };
