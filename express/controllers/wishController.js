const Wish = require('../models/wish');
const User = require('../models/user');
const Round = require('../models/round');

exports.createWish = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Create wish instance to calculate cost
    const wish = new Wish({
      user: userId,
      content
    });

    // Get user and check credits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.credits < wish.creditsCost) {
      return res.status(400).json({
        message: 'Insufficient credits',
        required: wish.creditsCost,
        current: user.credits
      });
    }

    // Get active round or create new one
    let activeRound = await Round.findCurrentRound();
    if (!activeRound) {
      activeRound = new Round({
        type: 'fast',
        requiredWishes: 50, // Initial requirement
        status: 'pending'
      });
      await activeRound.save();
    }

    if (!activeRound.canAddWish()) {
      return res.status(400).json({ message: 'Current round is not accepting wishes' });
    }

    // Assign wish to round
    wish.roundId = activeRound._id;
    await wish.save();

    // Update user
    user.credits -= wish.creditsCost;
    user.totalWishes += 1;
    user.lastWishAt = new Date();
    await user.save();

    // Update round
    activeRound.currentWishes += 1;
    if (activeRound.isReadyToStart()) {
      activeRound.status = 'active';
    }
    await activeRound.save();

    res.status(201).json({
      message: 'Wish created successfully',
      wish,
      remainingCredits: user.credits,
      round: {
        id: activeRound._id,
        status: activeRound.status,
        current: activeRound.currentWishes,
        required: activeRound.requiredWishes,
        progress: activeRound.progress
      }
    });
  } catch (error) {
    console.error('Error creating wish:', error);
    res.status(500).json({ message: 'Error creating wish', error: error.message });
  }
};

exports.getUserWishes = async (req, res) => {
  const userId = req.user.id;

  try {
    const wishes = await Wish.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('roundId', 'status type startTime endTime');

    res.json(wishes);
  } catch (error) {
    console.error('Error fetching wishes:', error);
    res.status(500).json({ message: 'Error fetching wishes', error: error.message });
  }
};

exports.getCurrentRound = async (req, res) => {
  try {
    const round = await Round.findCurrentRound()
      .populate('fulfilledWishes', 'content fulfillmentDetails');

    if (!round) {
      return res.status(404).json({ message: 'No active round found' });
    }

    res.json({
      id: round._id,
      type: round.type,
      status: round.status,
      currentWishes: round.currentWishes,
      requiredWishes: round.requiredWishes,
      progress: round.progress,
      startTime: round.startTime,
      fulfilledWishes: round.fulfilledWishes
    });
  } catch (error) {
    console.error('Error fetching round:', error);
    res.status(500).json({ message: 'Error fetching round', error: error.message });
  }
};

exports.fulfillWishes = async (req, res) => {
  const { roundId, fulfilledWishes } = req.body;

  try {
    const round = await Round.findById(roundId);
    if (!round || round.status !== 'active') {
      return res.status(400).json({ message: 'Invalid round or round not active' });
    }

    // Start AI processing
    round.aiProcessingStarted = new Date();
    await round.save();

    // Update wishes and calculate total rewards
    let totalRewards = 0;
    for (const { wishId, fulfillmentDetails } of fulfilledWishes) {
      const wish = await Wish.findById(wishId);
      if (wish && wish.status === 'pending') {
        wish.status = 'fulfilled';
        wish.fulfillmentDetails = fulfillmentDetails;
        await wish.save();

        // Update user's fulfilled wishes count
        await User.findByIdAndUpdate(wish.user, {
          $inc: { fulfilledWishes: 1 }
        });

        round.fulfilledWishes.push(wishId);
        totalRewards += fulfillmentDetails.rewardAmount || 0;
      }
    }

    // Complete round and prepare next round
    round.status = 'completed';
    round.endTime = new Date();
    round.totalRewardsDistributed = totalRewards;
    round.aiProcessingCompleted = new Date();

    // AI decides next round requirements based on current round performance
    const fulfillmentRate = round.fulfilledWishes.length / round.currentWishes;
    const nextRoundWishes = Math.max(20, Math.min(100, 
      Math.floor(round.currentWishes * (fulfillmentRate + 0.5))
    ));
    
    // Create next round
    const newRound = new Round({
      type: round.type === 'fast' ? 'daily' : 'fast',
      requiredWishes: nextRoundWishes,
      status: 'pending'
    });

    await Promise.all([
      round.save(),
      newRound.save()
    ]);

    res.json({
      message: 'Wishes fulfilled successfully',
      completedRound: {
        id: round._id,
        totalWishes: round.currentWishes,
        fulfilledWishes: round.fulfilledWishes.length,
        totalRewards: totalRewards
      },
      newRound: {
        id: newRound._id,
        type: newRound.type,
        requiredWishes: newRound.requiredWishes
      }
    });
  } catch (error) {
    console.error('Error fulfilling wishes:', error);
    res.status(500).json({ message: 'Error fulfilling wishes', error: error.message });
  }
};
