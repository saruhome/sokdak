/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // jest-expo's default pattern only transforms RN-ecosystem packages; @noble/hashes ships
  // pure ESM with no CJS build, so it needs to be added to the allowlist too.
  // decode-uri-component: 보안 override로 0.5.0(ESM 전용)을 강제해서 jest도 변환 필요 (Metro는 자체 처리).
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|@noble/hashes|decode-uri-component))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
  testMatch: [
    '<rootDir>/__tests__/**/*-test.(ts|tsx)',
    '<rootDir>/**/__tests__/**/*-test.(ts|tsx)',
  ],
  clearMocks: true,
};
