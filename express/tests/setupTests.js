const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Wish = require('../models/wish');
const { Config } = require('../models/config');

// Extindere matcher-i Jest
expect.extend({
  toBeValidMongoId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    return {
      message: () => `expected ${received} to be a valid MongoDB ObjectId`,
      pass
    };
  }
});

// Helper pentru creare user de test
global.createTestUser = async (overrides = {}) => {
  const defaultUser = {
    publicKey: `test-wallet-${Date.now()}`,
    credits: 100,
    activeWishes: 0,
    totalWishes: 0
  };

  const user = await User.create({
    ...defaultUser,
    ...overrides
  });

  return user;
};

// Helper pentru creare wish de test
global.createTestWish = async (userId, overrides = {}) => {
  const defaultWish = {
    user: userId,
    content: 'Test wish content',
    status: 'pending',
    credits: 1,
    analysis: {
      complexity: 5,
      categories: ['Test Category'],
      challenges: ['Test Challenge'],
      suggestions: ['Test Suggestion'],
      resources: {
        timeEstimate: '1 day',
        skillsRequired: ['Test Skill'],
        toolsNeeded: ['Test Tool']
      }
    },
    solution: {
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
    },
    aiModel: 'test-model',
    tokensUsed: {
      analysis: 100,
      solution: 200
    }
  };

  const wish = await Wish.create({
    ...defaultWish,
    ...overrides
  });

  return wish;
};

// Helper pentru creare config de test
global.createTestConfig = async (overrides = {}) => {
  const defaultConfig = {
    key: `test-config-${Date.now()}`,
    value: 'test-value',
    category: 'SYSTEM',
    description: 'Test config description',
    updatedBy: 'test-admin'
  };

  const config = await Config.create({
    ...defaultConfig,
    ...overrides
  });

  return config;
};

// Helper pentru generare token JWT
global.generateTestToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper pentru request-uri autentificate
global.authenticatedRequest = (request, token) => {
  return request.set('Authorization', `Bearer ${token}`);
};

// Helper pentru cleanup după fiecare test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Helper pentru verificare erori API
global.expectApiError = (response, status, message) => {
  expect(response.status).toBe(status);
  expect(response.body.success).toBe(false);
  if (message) {
    expect(response.body.error).toBe(message);
  }
};

// Helper pentru verificare succes API
global.expectApiSuccess = (response, data = null) => {
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  if (data) {
    expect(response.body).toMatchObject(data);
  }
};

// Mock pentru OpenRouter API
jest.mock('../services/aiService', () => ({
  analyzeWish: jest.fn().mockImplementation(global.mockOpenRouterApi.analyzeWish),
  generateSolution: jest.fn().mockImplementation(global.mockOpenRouterApi.generateSolution)
}));

// Mock pentru JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation(global.mockJwt.sign),
  verify: jest.fn().mockImplementation(global.mockJwt.verify)
}));
