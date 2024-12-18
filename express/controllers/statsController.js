const Wish = require('../models/wish');
const Round = require('../models/round');

exports.getLatestFulfilledWishes = async (req, res) => {
  try {
    const latestWishes = await Wish.find({ status: 'fulfilled' })
      .sort({ fulfilledAt: -1 })
      .limit(5)
      .populate('user', 'walletAddress')
      .select('content fulfillmentDetails fulfilledAt');

    const formattedWishes = latestWishes.map(wish => ({
      id: wish._id,
      content: wish.content.substring(0, 100) + (wish.content.length > 100 ? '...' : ''),
      fulfillmentDetails: wish.fulfillmentDetails,
      walletAddress: wish.user.walletAddress.substring(0, 6) + '...',
      fulfilledAt: wish.fulfilledAt
    }));

    res.json({
      success: true,
      wishes: formattedWishes
    });
  } catch (error) {
    console.error('Error fetching latest wishes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching latest wishes' 
    });
  }
};

exports.getTopRewards = async (req, res) => {
  try {
    const topWishes = await Wish.find({ status: 'fulfilled' })
      .sort({ 'fulfillmentDetails.rewardAmount': -1 })
      .limit(3)
      .populate('user', 'walletAddress')
      .select('content fulfillmentDetails fulfilledAt');

    const formattedTopWishes = topWishes.map(wish => ({
      id: wish._id,
      content: wish.content.substring(0, 100) + (wish.content.length > 100 ? '...' : ''),
      rewardAmount: wish.fulfillmentDetails.rewardAmount,
      walletAddress: wish.user.walletAddress.substring(0, 6) + '...',
      fulfilledAt: wish.fulfilledAt
    }));

    res.json({
      success: true,
      wishes: formattedTopWishes
    });
  } catch (error) {
    console.error('Error fetching top rewards:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching top rewards' 
    });
  }
};

exports.getRoundStatistics = async (req, res) => {
  try {
    const stats = await Round.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRounds: { $sum: 1 },
          totalWishesFulfilled: { $sum: { $size: '$fulfilledWishes' } },
          averageWishesPerRound: { $avg: '$currentWishes' }
        }
      }
    ]);

    const currentRound = await Round.findOne({ 
      status: { $in: ['active', 'pending'] } 
    }).select('type currentWishes requiredWishes status');

    res.json({
      success: true,
      stats: stats[0] || {
        totalRounds: 0,
        totalWishesFulfilled: 0,
        averageWishesPerRound: 0
      },
      currentRound: currentRound ? {
        type: currentRound.type,
        progress: Math.round((currentRound.currentWishes / currentRound.requiredWishes) * 100),
        status: currentRound.status
      } : null
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching statistics' 
    });
  }
};
