import Wish from '../models/wish.js';

export const getLatestFulfilledWishes = async (req, res) => {
  try {
    const latestWishes = await Wish.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('user', 'walletAddress')
      .select('content status credits updatedAt');

    const formattedWishes = latestWishes.map(wish => ({
      id: wish._id,
      content: wish.content.substring(0, 100) + (wish.content.length > 100 ? '...' : ''),
      credits: wish.credits,
      walletAddress: wish.user.walletAddress.substring(0, 6) + '...',
      completedAt: wish.updatedAt
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

export const getTopRewards = async (req, res) => {
  try {
    const topWishes = await Wish.find({ status: 'completed' })
      .sort({ credits: -1 })
      .limit(3)
      .populate('user', 'walletAddress')
      .select('content credits updatedAt');

    const formattedTopWishes = topWishes.map(wish => ({
      id: wish._id,
      content: wish.content.substring(0, 100) + (wish.content.length > 100 ? '...' : ''),
      credits: wish.credits,
      walletAddress: wish.user.walletAddress.substring(0, 6) + '...',
      completedAt: wish.updatedAt
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

export const getRoundStatistics = async (req, res) => {
  try {
    // Get overall stats from wishes
    const stats = await Wish.aggregate([
      {
        $group: {
          _id: null,
          totalWishes: { $sum: 1 },
          completedWishes: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    // Get current round stats (pending wishes)
    const currentRound = await Wish.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: null,
          currentWishes: { $sum: 1 },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalWishes: 0,
        completedWishes: 0,
        totalCredits: 0
      },
      currentRound: currentRound[0] ? {
        type: 'normal',
        currentWishes: currentRound[0].currentWishes,
        totalCredits: currentRound[0].totalCredits,
        status: 'active'
      } : {
        type: 'normal',
        currentWishes: 0,
        totalCredits: 0,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching statistics' 
    });
  }
};
