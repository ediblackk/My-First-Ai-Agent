import Wish from '../models/wish.js';
import User from '../models/user.js';
import * as aiService from '../services/aiService.js';

export const createWish = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    // Verificare user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizator negăsit'
      });
    }

    // Verificare credite
    if (user.credits < 1) {
      return res.status(400).json({
        success: false,
        error: 'Credite insuficiente'
      });
    }

    // Analiză dorință cu AI
    console.log('Analyzing wish:', content);
    const analysis = await aiService.analyzeWish(content);
    console.log('Wish analysis:', analysis);

    // Generare soluție cu AI
    console.log('Generating solution...');
    const solution = await aiService.generateSolution(
      content,
      analysis.complexity,
      analysis.challenges
    );
    console.log('Solution generated');

    // Creare dorință
    const wish = new Wish({
      user: userId,
      content,
      analysis,
      solution,
      status: 'pending',
      credits: 1 // Cost fix pentru o dorință
    });

    // Salvare dorință și actualizare user
    await wish.save();
    user.credits -= wish.credits;
    user.activeWishes += 1;
    user.totalWishes += 1;
    user.lastWishAt = new Date();
    await user.save();

    res.json({
      success: true,
      wish: {
        id: wish._id,
        content: wish.content,
        analysis: wish.analysis,
        solution: wish.solution,
        status: wish.status,
        credits: wish.credits,
        createdAt: wish.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating wish:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Eroare la crearea dorinței'
    });
  }
};

export const getUserWishes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const wishes = await Wish.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Wish.countDocuments(query);

    res.json({
      success: true,
      wishes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching wishes:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținerea dorințelor'
    });
  }
};

export const getWishDetails = async (req, res) => {
  try {
    const { wishId } = req.params;
    const userId = req.user.id;

    const wish = await Wish.findOne({
      _id: wishId,
      user: userId
    }).select('-__v');

    if (!wish) {
      return res.status(404).json({
        success: false,
        error: 'Dorință negăsită'
      });
    }

    res.json({
      success: true,
      wish
    });
  } catch (error) {
    console.error('Error fetching wish details:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținerea detaliilor dorinței'
    });
  }
};

export const updateWishStatus = async (req, res) => {
  try {
    const { wishId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const wish = await Wish.findOne({
      _id: wishId,
      user: userId
    });

    if (!wish) {
      return res.status(404).json({
        success: false,
        error: 'Dorință negăsită'
      });
    }

    // Actualizare status și user stats
    const oldStatus = wish.status;
    wish.status = status;
    await wish.save();

    const user = await User.findById(userId);
    if (oldStatus === 'pending' && status === 'completed') {
      user.activeWishes -= 1;
    } else if (oldStatus === 'completed' && status === 'pending') {
      user.activeWishes += 1;
    }
    await user.save();

    res.json({
      success: true,
      wish: {
        id: wish._id,
        status: wish.status,
        updatedAt: wish.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating wish status:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la actualizarea statusului dorinței'
    });
  }
};

export const deleteWish = async (req, res) => {
  try {
    const { wishId } = req.params;
    const userId = req.user.id;

    const wish = await Wish.findOne({
      _id: wishId,
      user: userId
    });

    if (!wish) {
      return res.status(404).json({
        success: false,
        error: 'Dorință negăsită'
      });
    }

    // Actualizare user stats înainte de ștergere
    if (wish.status === 'pending') {
      const user = await User.findById(userId);
      user.activeWishes -= 1;
      await user.save();
    }

    await wish.remove();

    res.json({
      success: true,
      message: 'Dorință ștearsă cu succes'
    });
  } catch (error) {
    console.error('Error deleting wish:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la ștergerea dorinței'
    });
  }
};

export const getCurrentRound = async (req, res) => {
  try {
    const currentRound = await Wish.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: null,
          totalWishes: { $sum: 1 },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    res.json({
      success: true,
      round: currentRound[0] || { totalWishes: 0, totalCredits: 0 }
    });
  } catch (error) {
    console.error('Error fetching current round:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținerea rundei curente'
    });
  }
};

export const fulfillWishes = async (req, res) => {
  try {
    const { wishes } = req.body;
    
    if (!Array.isArray(wishes)) {
      return res.status(400).json({
        success: false,
        error: 'Lista de dorințe invalidă'
      });
    }

    const results = await Promise.all(wishes.map(async (wishData) => {
      const { wishId, solution } = wishData;
      
      const wish = await Wish.findById(wishId);
      if (!wish) {
        return {
          wishId,
          success: false,
          error: 'Dorință negăsită'
        };
      }

      wish.solution = solution;
      wish.status = 'completed';
      await wish.save();

      // Actualizare user stats
      const user = await User.findById(wish.user);
      if (user) {
        user.activeWishes -= 1;
        await user.save();
      }

      return {
        wishId,
        success: true
      };
    }));

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fulfilling wishes:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la îndeplinirea dorințelor'
    });
  }
};
