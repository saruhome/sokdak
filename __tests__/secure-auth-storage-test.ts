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
import * as aesjs from 'aes-js';
import { secureAuthStorage } from '../constants/secureAuthStorage';

/** v1(레거시, MAC 없음) 형식으로 직접 암호화 — 마이그레이션 테스트용. secureAuthStorage.setItem으로
 * 만든 root secret을 그대로 재사용해 실제 v1 데이터가 남아있던 상황을 재현한다. */
function encryptLikeV1(value: string, rootKeyHex: string) {
  const key = aesjs.utils.hex.toBytes(rootKeyHex);
  const nonce = new Array(16).fill(0).map((_, i) => i); // deterministic, test-only
  const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce));
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
  return `${aesjs.utils.hex.fromBytes(nonce)}.${aesjs.utils.hex.fromBytes(encrypted)}`;
}

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

  it('migrates an existing v1 (unauthenticated) session to v2 on first read', async () => {
    // v1 세션이 이미 저장돼 있던 상황을 재현: root secret은 먼저 만들어두고,
    // 그 secret으로 v1 알고리즘(MAC 없음)으로 직접 암호화한 값을 심어둔다.
    await secureAuthStorage.setItem('supabase.auth.token', 'placeholder');
    const rootKeyHex = mockSecureValues.get('sokdak.auth.encryption-key.supabase.auth.token')!;
    await AsyncStorage.setItem('supabase.auth.token', encryptLikeV1('legacy-v1-session', rootKeyHex));

    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBe('legacy-v1-session');
    expect(await AsyncStorage.getItem('supabase.auth.token')).toMatch(/^v2\./);
    // v2로 업그레이드된 뒤에도 같은 값을 계속 정상적으로 읽는다.
    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBe('legacy-v1-session');
  });

  it('rejects a ciphertext with a single tampered byte', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');
    const stored = (await AsyncStorage.getItem('supabase.auth.token'))!;
    const [tag, nonceHex, cipherHex, macHex] = stored.split('.');
    const tamperedCipher = (parseInt(cipherHex[0], 16) ^ 1).toString(16) + cipherHex.slice(1);

    await AsyncStorage.setItem('supabase.auth.token', [tag, nonceHex, tamperedCipher, macHex].join('.'));

    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBeNull();
  });

  it('rejects a tampered nonce', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');
    const stored = (await AsyncStorage.getItem('supabase.auth.token'))!;
    const [tag, nonceHex, cipherHex, macHex] = stored.split('.');
    const tamperedNonce = (parseInt(nonceHex[0], 16) ^ 1).toString(16) + nonceHex.slice(1);

    await AsyncStorage.setItem('supabase.auth.token', [tag, tamperedNonce, cipherHex, macHex].join('.'));

    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBeNull();
  });

  it('rejects a tampered MAC tag', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');
    const stored = (await AsyncStorage.getItem('supabase.auth.token'))!;
    const [tag, nonceHex, cipherHex, macHex] = stored.split('.');
    const tamperedMac = (parseInt(macHex[0], 16) ^ 1).toString(16) + macHex.slice(1);

    await AsyncStorage.setItem('supabase.auth.token', [tag, nonceHex, cipherHex, tamperedMac].join('.'));

    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBeNull();
  });

  it('rejects an unrecognized version tag', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');
    const stored = (await AsyncStorage.getItem('supabase.auth.token'))!;
    const [, nonceHex, cipherHex, macHex] = stored.split('.');

    await AsyncStorage.setItem('supabase.auth.token', ['v3', nonceHex, cipherHex, macHex].join('.'));

    await expect(secureAuthStorage.getItem('supabase.auth.token')).resolves.toBeNull();
  });

  it('clears the corrupted item after a failed tamper-detected read', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'sensitive-session-token');
    const stored = (await AsyncStorage.getItem('supabase.auth.token'))!;
    const [tag, nonceHex, cipherHex, macHex] = stored.split('.');
    const tamperedMac = (parseInt(macHex[0], 16) ^ 1).toString(16) + macHex.slice(1);
    await AsyncStorage.setItem('supabase.auth.token', [tag, nonceHex, cipherHex, tamperedMac].join('.'));

    await secureAuthStorage.getItem('supabase.auth.token');

    await expect(AsyncStorage.getItem('supabase.auth.token')).resolves.toBeNull();
  });
});
