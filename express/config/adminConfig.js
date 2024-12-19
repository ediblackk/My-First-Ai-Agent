// Lista de wallet-uri admin
export const adminWallets = [
  process.env.ADMIN_WALLET_ADDRESS,  // Admin principal
];

// Configurare sesiune admin
export const session = {
  tokenExpiry: '24h',  // Durata token JWT admin
  refreshExpiry: '7d'  // Durata refresh token
};

// Rate limiting pentru API admin
export const rateLimit = {
  window: 15 * 60 * 1000, // 15 minute
  max: 100 // request-uri per window
};

// Permisiuni disponibile
export const permissions = {
  MANAGE_USERS: 'manage_users',
  MANAGE_CREDITS: 'manage_credits',
  MANAGE_CONFIG: 'manage_config',
  VIEW_STATS: 'view_stats',
  MANAGE_AI: 'manage_ai'
};

// Roluri predefinite
export const roles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    permissions: [
      'manage_users',
      'manage_credits',
      'manage_config',
      'view_stats',
      'manage_ai'
    ]
  },
  SUPPORT_ADMIN: {
    name: 'Support Admin',
    permissions: [
      'view_stats',
      'manage_users'
    ]
  }
};

// Acțiuni care trebuie logate
export const auditActions = {
  USER_CREDIT_MODIFY: 'user_credit_modify',
  CONFIG_CHANGE: 'config_change',
  AI_CONFIG_CHANGE: 'ai_config_change',
  USER_ROLE_CHANGE: 'user_role_change'
};

// Setări pentru logging
export const logging = {
  enabled: true,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  auditLog: true
};
