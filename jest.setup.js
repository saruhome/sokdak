globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// useSafeAreaInsets needs a SafeAreaProvider; tests render components directly,
// so serve the library's official mock (insets/frame all zero).
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return { ...actual, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});

// expo-speech-recognition is a native module absent from the jest environment;
// screens that embed VoiceSearchButton need this default mock to load. Suites
// that exercise the button itself override it with their own jest.mock.
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: jest.fn(() => false),
    requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
    getPermissionsAsync: jest.fn(async () => ({ granted: false })),
    start: jest.fn(),
    stop: jest.fn(),
  },
  useSpeechRecognitionEvent: jest.fn(),
}));
