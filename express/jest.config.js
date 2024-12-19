module.exports = {
  // Mediul de test
  testEnvironment: 'node',

  // Directoare pentru teste
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],

  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/'
  ],
  coverageReporters: ['text', 'lcov', 'clover'],

  // Timeout pentru teste
  testTimeout: 10000,

  // Setup și teardown global
  globalSetup: '<rootDir>/tests/setup.js',
  globalTeardown: '<rootDir>/tests/teardown.js',

  // Module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Transformări
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  // Fișiere de setup pentru fiecare test suite
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // Variabile de mediu pentru teste
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  }
};
