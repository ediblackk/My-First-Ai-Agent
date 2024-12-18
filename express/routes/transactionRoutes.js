const express = require('express');
const router = express.Router();
const { validateTransfer, getTransactionStatus, createTransaction } = require('../controllers/transactionController');

// Public routes (these need to be public for wallet integration)
router.post('/create', createTransaction);
router.post('/validate', validateTransfer);
router.get('/status/:signature', getTransactionStatus);

module.exports = router;
