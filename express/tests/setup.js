const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // Creare instanță MongoDB în memorie pentru teste
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Conectare la MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Salvare referință pentru teardown
  global.__MONGOD__ = mongoServer;

  // Setup mock pentru OpenRouter API
  global.mockOpenRouterApi = {
    analyzeWish: jest.fn().mockResolvedValue({
      complexity: 5,
      categories: ['Test Category'],
      challenges: ['Test Challenge'],
      suggestions: ['Test Suggestion'],
      resources: {
        timeEstimate: '1 day',
        skillsRequired: ['Test Skill'],
        toolsNeeded: ['Test Tool']
      }
    }),
    generateSolution: jest.fn().mockResolvedValue({
      steps: [{
        order: 1,
        description: 'Test Step',
        timeEstimate: '1 hour',
        dependencies: []
      }],
      timeline: '1 day',
      resources: ['Test Resource'],
      risks: [{
        description: 'Test Risk',
        mitigation: 'Test Mitigation'
      }],
      successCriteria: ['Test Criteria']
    })
  };

  // Setup mock pentru JWT
  global.mockJwt = {
    sign: jest.fn().mockReturnValue('test.jwt.token'),
    verify: jest.fn().mockReturnValue({ id: 'test-user-id' })
  };

  // Setup variabile de mediu pentru teste
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.OPENROUTER_API_KEY = 'test-openrouter-api-key';
  process.env.ADMIN_WALLET_ADDRESS = 'test-admin-wallet';
  process.env.PRIZE_POOL_PERCENTAGE = '80';
};
