import { Config, AdminLog } from '../models/config.js';
import User from '../models/user.js';
import * as adminConfig from '../config/adminConfig.js';
import Wish from '../models/wish.js';

// Verificare admin
export const verifyAdmin = async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        error: 'Public key necesar'
      });
    }

    // Verifică dacă wallet-ul este în lista de admin
    const isAdmin = adminConfig.adminWallets.includes(publicKey);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Acces interzis'
      });
    }

    res.json({
      success: true,
      role: 'SUPER_ADMIN', // Temporar, până implementăm roluri în DB
      permissions: adminConfig.roles.SUPER_ADMIN.permissions
    });
  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la verificare admin'
    });
  }
};

// Gestionare utilizatori
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.publicKey = new RegExp(search, 'i');
    }

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere utilizatori'
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizator negăsit'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere detalii utilizator'
    });
  }
};

export const modifyUserCredits = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizator negăsit'
      });
    }

    // Validare amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Sumă invalidă'
      });
    }

    // Actualizare credite
    user.credits += parseInt(amount);
    if (user.credits < 0) user.credits = 0;
    
    await user.save();

    // Log acțiune
    await AdminLog.logAction(
      'USER_CREDIT_MODIFY',
      req.admin.publicKey,
      {
        userId: user._id,
        amount,
        reason,
        newBalance: user.credits
      },
      req
    );

    res.json({
      success: true,
      credits: user.credits
    });
  } catch (error) {
    console.error('Modify credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la modificare credite'
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilizator negăsit'
      });
    }

    // Verifică dacă rolul este valid
    if (!adminConfig.roles[role]) {
      return res.status(400).json({
        success: false,
        error: 'Rol invalid'
      });
    }

    // Actualizare rol
    user.role = role;
    await user.save();

    // Log acțiune
    await AdminLog.logAction(
      'USER_ROLE_CHANGE',
      req.admin.publicKey,
      {
        userId: user._id,
        oldRole: user.role,
        newRole: role
      },
      req
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la actualizare rol utilizator'
    });
  }
};

// Configurări sistem
export const getConfig = async (req, res) => {
  try {
    const { category } = req.query;
    let configs;

    if (category) {
      configs = await Config.getByCategory(category);
    } else {
      configs = await Config.find().select('-__v');
    }

    res.json({
      success: true,
      configs
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere configurări'
    });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Key și value necesare'
      });
    }

    const config = await Config.updateConfig(key, value, req.admin.publicKey);

    // Log acțiune
    await AdminLog.logAction(
      'CONFIG_CHANGE',
      req.admin.publicKey,
      {
        key,
        oldValue: config.value,
        newValue: value
      },
      req
    );

    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la actualizare configurare'
    });
  }
};

// Configurări AI
export const getAIConfig = async (req, res) => {
  try {
    const configs = await Config.getByCategory('AI');
    res.json({
      success: true,
      configs
    });
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere configurări AI'
    });
  }
};

export const updateAIConfig = async (req, res) => {
  try {
    const { model, maxTokens } = req.body;
    const updates = [];

    if (model) {
      updates.push(
        Config.updateConfig('AI_MODEL', model, req.admin.publicKey)
      );
    }

    if (maxTokens) {
      updates.push(
        Config.updateConfig('AI_MAX_TOKENS', maxTokens, req.admin.publicKey)
      );
    }

    await Promise.all(updates);

    // Log acțiune
    await AdminLog.logAction(
      'AI_CONFIG_CHANGE',
      req.admin.publicKey,
      { model, maxTokens },
      req
    );

    res.json({
      success: true,
      message: 'Configurări AI actualizate'
    });
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la actualizare configurări AI'
    });
  }
};

// Statistici
export const getStatsOverview = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      activeUsers: await User.countDocuments({ lastWishAt: { $gt: new Date(Date.now() - 24*60*60*1000) } }),
      totalCredits: await User.aggregate([
        { $group: { _id: null, total: { $sum: '$credits' } } }
      ]),
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere statistici'
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $gt: ['$lastWishAt', new Date(Date.now() - 24*60*60*1000)] },
                1,
                0
              ]
            }
          },
          totalCredits: { $sum: '$credits' },
          averageCredits: { $avg: '$credits' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        totalCredits: 0,
        averageCredits: 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere statistici utilizatori'
    });
  }
};

export const getTransactionStats = async (req, res) => {
  try {
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
          totalCreditsSpent: { $sum: '$credits' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalWishes: 0,
        completedWishes: 0,
        totalCreditsSpent: 0
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere statistici tranzacții'
    });
  }
};

export const getWishStats = async (req, res) => {
  try {
    const stats = await Wish.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCredits: { $avg: '$credits' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats.reduce((acc, curr) => {
        acc[curr._id] = {
          count: curr.count,
          avgCredits: Math.round(curr.avgCredits * 100) / 100
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get wish stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere statistici dorințe'
    });
  }
};

// Logs
export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AdminLog.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    const total = await AdminLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere loguri'
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (action) {
      query.action = action;
    }

    const logs = await AdminLog.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    const total = await AdminLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Eroare la obținere loguri audit'
    });
  }
};
