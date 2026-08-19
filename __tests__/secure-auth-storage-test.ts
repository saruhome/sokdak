const mockSecureValues = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only',
  getItemAsync: jest.fn(async (key: string) => mockSecureValues.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureValues.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureValues.delete(key);
  }),
}));

jest.mock('react-native-get-random-values', () => ({}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureAuthStorage } from '../constants/secureAuthStorage';

describe('secureAuthStorage', () => {
  beforeEach(async () => {
    mockSecureValues.clear();
    await AsyncStorage.clear();
  });

  it('stores session data encrypted in AsyncStorage and returns the original value', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');

    expect(await AsyncStorage.getItem('supabase.auth.token')).not.toContain('sensitive-session-token');
    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBe('sensitive-session-token');
  });

  it('migrates a legacy plaintext session during its first read', async () => {
    await AsyncStorage.setItem('legacy.token', 'legacy-session-token');

    await expect(secureAuthStorage.getItem('legacy.token')).resolves.toBe('legacy-session-token');
    expect(await AsyncStorage.getItem('legacy.token')).not.toContain('legacy-session-token');
    await expect(secureAuthStorage.getItem('legacy.token')).resolves.toBe('legacy-session-token');
  });

  it('removes the cipher text and the OS-backed encryption key together', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');

    await secureAuthStorage.removeItem('supabase.auth.token');

    await expect(AsyncStorage.getItem('supabase.auth.token')).resolves.toBeNull();
    expect(mockSecureValues.size).toBe(0);
  });
});
