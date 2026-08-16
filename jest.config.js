/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*-test.(ts|tsx)',
    '<rootDir>/**/__tests__/**/*-test.(ts|tsx)',
  ],
  clearMocks: true,
};
