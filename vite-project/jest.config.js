module.exports = {
  // Mediul de test
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],

  // Module transformations
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-react'] }],
    '.+\\.(css|scss|png|jpg|svg)$': 'jest-transform-stub'
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },

  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/tests/**',
    '!src/**/*.test.{js,jsx}',
    '!src/main.jsx',
    '!src/vite-env.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],

  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],

  // Test utilities
  testPathIgnorePatterns: ['/node_modules/', '/.vite/'],
  
  // Performance
  maxWorkers: '50%',
  
  // Timeouts
  testTimeout: 10000,

  // Globals
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  },

  // Module directories
  moduleDirectories: ['node_modules', 'src'],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
