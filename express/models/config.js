import mongoose from 'mongoose';

// Schema pentru configurări sistem
const ConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['SYSTEM', 'AI', 'GAME', 'SECURITY']
  },
  description: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String, // Admin publicKey
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Schema pentru log-uri admin
const AdminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  adminPublicKey: {
    type: String,
    required: true,
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Configurări predefinite sistem
const defaultConfigs = [
  {
    key: 'AI_MODEL',
    value: 'gpt-4',
    category: 'AI',
    description: 'Modelul AI folosit pentru procesarea dorințelor'
  },
  {
    key: 'AI_MAX_TOKENS',
    value: 1000,
    category: 'AI',
    description: 'Numărul maxim de tokens per request'
  },
  {
    key: 'GAME_CREDITS_RATE',
    value: 6,
    category: 'GAME',
    description: 'Rate de conversie SOL la credite'
  },
  {
    key: 'GAME_MIN_CREDITS',
    value: 1,
    category: 'GAME',
    description: 'Număr minim de credite pentru o dorință'
  },
  {
    key: 'SECURITY_MAX_WISHES',
    value: 10,
    category: 'SECURITY',
    description: 'Număr maxim de dorințe active per utilizator'
  }
];

// Metodă pentru inițializare configurări implicite
ConfigSchema.statics.initializeDefaults = async function(adminPublicKey) {
  for (const config of defaultConfigs) {
    await this.findOneAndUpdate(
      { key: config.key },
      { 
        ...config,
        updatedBy: adminPublicKey,
        updatedAt: new Date()
      },
      { 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  }
};

// Metodă pentru log acțiuni admin
AdminLogSchema.statics.logAction = async function(action, adminPublicKey, details, req) {
  return this.create({
    action,
    adminPublicKey,
    details,
    ip: req?.ip,
    userAgent: req?.headers['user-agent']
  });
};

// Metodă pentru căutare configurări după categorie
ConfigSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

// Metodă pentru actualizare configurare
ConfigSchema.statics.updateConfig = async function(key, value, adminPublicKey) {
  const config = await this.findOne({ key });
  if (!config) {
    throw new Error(`Configurare negăsită: ${key}`);
  }

  return this.findOneAndUpdate(
    { key },
    {
      value,
      updatedBy: adminPublicKey,
      updatedAt: new Date()
    },
    { new: true }
  );
};

const Config = mongoose.model('Config', ConfigSchema);
const AdminLog = mongoose.model('AdminLog', AdminLogSchema);

export { Config, AdminLog };
