const crypto = require('crypto');

exports.generateUniqueId = () => {
  return crypto.randomBytes(8).toString('hex');
};

exports.calculateCredits = (amount) => {
  // 1 credit for every 0.1 SOL
  return Math.floor(amount / 0.1);
};

exports.validateSolanaAddress = (address) => {
  // Basic validation for Solana address format
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

exports.formatWalletAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

exports.retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await exports.sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
};
