import mongoose from 'mongoose';

// Cache for validated transactions to prevent duplicates
const validatedTransactions = new Set();

// Calculate credits based on SOL amount and current rate
export const calculateCreditsForAmount = async (solAmount) => {
  if (!solAmount || isNaN(solAmount) || solAmount <= 0) {
    throw new Error('Invalid SOL amount');
  }

  const rate = parseInt(process.env.SOL_TO_CREDITS_RATE || '6');
  return Math.floor(solAmount * rate);
};

// Validate transaction hasn't been processed before
export const validateTransaction = (signature) => {
  if (validatedTransactions.has(signature)) {
    throw new Error('Transaction already processed');
  }
  validatedTransactions.add(signature);
  
  // Cleanup old transactions after 1 hour
  setTimeout(() => {
    validatedTransactions.delete(signature);
  }, 60 * 60 * 1000);
};
