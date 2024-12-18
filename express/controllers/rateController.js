const dotenv = require('dotenv');

const calculateDynamicRate = async () => {
  try {
    // Reload .env file to get fresh values
    dotenv.config({ override: true });
    
    console.log('Using static rate from env...');
    // Use static rate from environment variable
    const staticRate = parseFloat(process.env.SOL_TO_CREDITS_RATE || "10");
    console.log('Static rate loaded from env:', staticRate);
    return staticRate;

    // Dynamic rate calculation can be implemented later
    /*
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    const solPriceUSD = data.solana.usd;
    const creditsPerSol = Math.floor(solPriceUSD);
    return creditsPerSol;
    */
  } catch (error) {
    console.error('Error calculating rate:', error);
    // Return default rate if calculation fails
    dotenv.config({ override: true }); // Reload .env even in error case
    const fallbackRate = parseFloat(process.env.SOL_TO_CREDITS_RATE || "10");
    console.error('Using fallback rate:', fallbackRate);
    return fallbackRate;
  }
};

exports.getCurrentRates = async (req, res) => {
  try {
    console.log('Getting current rates...');
    const creditsRate = await calculateDynamicRate();
    console.log('Current credits rate:', creditsRate);

    // Reload .env to get fresh values
    dotenv.config({ override: true });
    
    // Ensure these values exist and have defaults
    const prizePoolPercentage = parseInt(process.env.PRIZE_POOL_PERCENTAGE || "80");
    const adminPercentage = parseInt(process.env.ADMIN_PERCENTAGE || "20");

    console.log('Using percentages:', {
      prizePool: prizePoolPercentage,
      admin: adminPercentage
    });

    const response = {
      success: true,
      rates: {
        solToCredits: creditsRate,
        splits: {
          prizePool: prizePoolPercentage,
          admin: adminPercentage
        }
      },
      lastUpdated: new Date().toISOString()
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Detailed error in getCurrentRates:', {
      message: error.message,
      stack: error.stack
    });
    
    // Send more detailed error information in development
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? `Error: ${error.message}` 
        : 'Failed to get current rates'
    });
  }
};

// Cache for storing recent transactions to prevent duplicates
const recentTransactions = new Set();
const TRANSACTION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

exports.validateTransaction = (signature) => {
  if (recentTransactions.has(signature)) {
    throw new Error('Transaction already processed');
  }
  
  // Add to recent transactions
  recentTransactions.add(signature);
  
  // Remove from cache after duration
  setTimeout(() => {
    recentTransactions.delete(signature);
  }, TRANSACTION_CACHE_DURATION);
};

// Export for use in other controllers
exports.calculateCreditsForAmount = async (solAmount) => {
  const rate = await calculateDynamicRate();
  return Math.floor(solAmount * rate);
};

// Export for use in withdrawal calculations
exports.calculateTokensForCredits = async (credits) => {
  const rate = await calculateDynamicRate();
  return Math.floor(credits / rate);
};
