import type { Config } from 'jest';

const config: Config = {
  // Test environment
  testEnvironment: 'jsdom',

  // File extensions to look for
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}',
  ],

  // Coverage patterns
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/App.tsx',
    '!src/types/**/*',
    '!src/test/**/*',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // Module name mapping (matches TypeScript paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.app.json',
      },
    ],
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset modules between tests
  resetModules: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Collect coverage
  collectCoverage: false, // Set to true when running coverage

  // Coverage directory
  coverageDirectory: 'coverage',

  // Coverage provider
  coverageProvider: 'v8',
};

export default config;
