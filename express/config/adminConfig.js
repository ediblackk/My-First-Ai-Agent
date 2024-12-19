// Lista de wallet-uri admin
export const adminWallets = process.env.ADMIN_WALLETS ? 
  process.env.ADMIN_WALLETS.split(',').map(w => w.trim()) : 
  [];

// Configurare sesiune admin
export const session = {
  tokenExpiry: '24h',
  refreshExpiry: '7d'
};

// Logging pentru acțiuni admin
export const logging = {
  enabled: true,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  auditLog: true
};
