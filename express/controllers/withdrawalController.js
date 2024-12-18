const solanaWeb3 = require('@solana/web3.js');
const User = require('../models/user');
const { calculateTokensForCredits } = require('./rateController');

exports.requestWithdrawal = async (req, res) => {
  const { credits, publicKey } = req.body;

  if (!credits || !publicKey || isNaN(credits) || credits <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credits amount or public key'
    });
  }

  try {
    // Find user
    const user = await User.findOne({ walletAddress: publicKey });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get current rate
    const rate = await calculateTokensForCredits(1); // Get tokens per credit
    
    // Request withdrawal
    const { tokens, conversionId } = await user.requestWithdrawal(credits, rate);

    // Create transaction for token transfer
    const connection = new solanaWeb3.Connection(
      process.env.SOLANA_RPC_URL || solanaWeb3.clusterApiUrl('devnet'),
      'confirmed'
    );

    // Create transaction
    const transaction = new solanaWeb3.Transaction();

    // Add transfer from prize pool wallet to user
    transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: new solanaWeb3.PublicKey(process.env.SOLANA_PRIZE_POOL_WALLET),
        toPubkey: new solanaWeb3.PublicKey(publicKey),
        lamports: tokens * solanaWeb3.LAMPORTS_PER_SOL
      })
    );

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new solanaWeb3.PublicKey(process.env.SOLANA_PRIZE_POOL_WALLET);

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    res.json({
      success: true,
      conversionId,
      transaction: serializedTransaction.toString('base64'),
      details: {
        creditsConverted: credits,
        tokensToReceive: tokens,
        rate: rate
      }
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing withdrawal request'
    });
  }
};

exports.completeWithdrawal = async (req, res) => {
  const { publicKey, signature, conversionId } = req.body;

  if (!publicKey || !signature || !conversionId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters'
    });
  }

  try {
    // Find user
    const user = await User.findOne({ walletAddress: publicKey });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify transaction
    const connection = new solanaWeb3.Connection(
      process.env.SOLANA_RPC_URL || solanaWeb3.clusterApiUrl('devnet'),
      'confirmed'
    );

    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Complete the withdrawal
    const conversion = await user.completeWithdrawal(conversionId, signature);

    res.json({
      success: true,
      conversion,
      remainingCredits: user.credits,
      pendingCredits: user.pendingCredits
    });

  } catch (error) {
    console.error('Withdrawal completion error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error completing withdrawal'
    });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  const { publicKey } = req.params;

  try {
    const user = await User.findOne({ walletAddress: publicKey });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get withdrawal history
    const withdrawals = user.conversionHistory
      .filter(conv => conv.type === 'WITHDRAWAL')
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      withdrawals,
      stats: {
        pendingCredits: user.pendingCredits,
        availableCredits: user.credits,
        pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING').length
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching withdrawal history'
    });
  }
};
