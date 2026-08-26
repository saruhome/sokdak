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

  it('survives a simulated app restart (fresh module instance, same persisted stores)', async () => {
    const sessionJson = JSON.stringify({ access_token: 'redacted', user: { id: 'user-1' } });
    await secureAuthStorage.setItem('supabase.auth.token', sessionJson);
    const persistedCiphertext = (await AsyncStorage.getItem('supabase.auth.token'))!;

    // 재시작 시뮬레이션: 모듈 레지스트리를 초기화해 in-memory 상태를 전부 버린다.
    // SecureStore mock(mockSecureValues)은 테스트 파일 스코프라 디스크처럼 유지되지만,
    // AsyncStorage mock의 저장소는 모듈 스코프라 리셋과 함께 사라진다 — 실제 기기의
    // 디스크 지속성을 흉내내기 위해 저장돼 있던 암호문을 새 인스턴스에 그대로 되살린다.
    jest.resetModules();
    const freshAsyncStorageModule = require('@react-native-async-storage/async-storage');
    const freshAsyncStorage = freshAsyncStorageModule.default ?? freshAsyncStorageModule;
    await freshAsyncStorage.setItem('supabase.auth.token', persistedCiphertext);
    const fresh = require('../constants/secureAuthStorage').secureAuthStorage as typeof secureAuthStorage;

    await expect(fresh.getItem('supabase.auth.token')).resolves.toBe(sessionJson);
  });

  it('concurrent get/set/remove on the same key never leaves a corrupted value behind', async () => {
    await secureAuthStorage.setItem('supabase.auth.token', 'initial');

    await Promise.all([
      secureAuthStorage.getItem('supabase.auth.token'),
      secureAuthStorage.setItem('supabase.auth.token', 'second'),
      secureAuthStorage.getItem('supabase.auth.token'),
      secureAuthStorage.setItem('supabase.auth.token', 'third'),
      secureAuthStorage.removeItem('supabase.auth.token'),
      secureAuthStorage.setItem('supabase.auth.token', 'final'),
    ]);

    // 어느 순서로 끝났든, 최종 상태는 "정상 복호화되는 값" 또는 "완전히 삭제됨" 중 하나여야
    // 하며 절대 손상된(복호화 실패) 값이 남으면 안 된다. getItem이 null을 반환하는 경우는
    // remove가 마지막이었던 경우뿐이고, 그때 저장소도 함께 비어 있어야 한다.
    const value = await secureAuthStorage.getItem('supabase.auth.token');
    if (value === null) {
      await expect(AsyncStorage.getItem('supabase.auth.token')).resolves.toBeNull();
    } else {
      expect(['initial', 'second', 'third', 'final']).toContain(value);
    }
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
