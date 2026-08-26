import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';
import { hkdf } from '@noble/hashes/hkdf.js';
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';

const KEY_PREFIX = 'sokdak.auth.encryption-key.';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
const V2_ENC_INFO = 'sokdak-auth-v2-enc';
const V2_MAC_INFO = 'sokdak-auth-v2-mac';

function secureKeyName(key: string) {
  return `${KEY_PREFIX}${key}`;
}

/** aes-js's byte utils return plain number[], but @noble/hashes strictly requires real Uint8Array. */
function toU8(bytes: number[] | Uint8Array): Uint8Array {
  return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
}

function newEncryptionKey() {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
}

/** SecureStore에 저장된 비밀은 그대로 AES 키로 쓰지 않고, HKDF로 암호화/MAC 키를 분리 유도한다
 * (한 비밀을 두 용도로 재사용하지 않는 표준 관행). v1(레거시)은 저장된 비밀을 AES 키로 직접 썼으므로
 * 마이그레이션 시에는 raw 비밀도 그대로 유지해야 한다. */
function deriveV2Keys(rootKey: Uint8Array) {
  return {
    encKey: hkdf(sha256, rootKey, undefined, toU8(aesjs.utils.utf8.toBytes(V2_ENC_INFO)), 32),
    macKey: hkdf(sha256, rootKey, undefined, toU8(aesjs.utils.utf8.toBytes(V2_MAC_INFO)), 32),
  };
}

async function getOrCreateRootKey(storageKey: string) {
  const keyName = secureKeyName(storageKey);
  const current = await SecureStore.getItemAsync(keyName, SECURE_STORE_OPTIONS);
  if (current) return toU8(aesjs.utils.hex.toBytes(current));

  const next = newEncryptionKey();
  await SecureStore.setItemAsync(keyName, aesjs.utils.hex.fromBytes(next), SECURE_STORE_OPTIONS);
  return next;
}

function aesCtr(key: Uint8Array, nonce: Uint8Array) {
  return new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce));
}

/** 상수 시간 비교 — 타이밍 사이드채널로 MAC을 추측하지 못하게 한다. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function encryptV2(value: string, rootKey: Uint8Array) {
  const { encKey, macKey } = deriveV2Keys(rootKey);
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  const cipher = aesCtr(encKey, nonce).encrypt(aesjs.utils.utf8.toBytes(value));
  const payload = `v2.${aesjs.utils.hex.fromBytes(nonce)}.${aesjs.utils.hex.fromBytes(cipher)}`;
  const mac = hmac(sha256, macKey, toU8(aesjs.utils.utf8.toBytes(payload)));
  return `${payload}.${aesjs.utils.hex.fromBytes(mac)}`;
}

/** v2 포맷 복호화. 버전 태그·nonce·암호문 중 무엇이 변조되어도 MAC 불일치로 잡아낸다.
 * 실패 시(변조·손상·알 수 없는 버전) null — 호출부가 저장된 항목을 지우고 로그아웃 처리한다. */
function decryptV2(value: string, rootKey: Uint8Array): string | null {
  const parts = value.split('.');
  if (parts.length !== 4 || parts[0] !== 'v2') return null;
  const [, nonceHex, cipherHex, macHex] = parts;

  const { encKey, macKey } = deriveV2Keys(rootKey);
  const payload = `v2.${nonceHex}.${cipherHex}`;
  const expectedMac = hmac(sha256, macKey, toU8(aesjs.utils.utf8.toBytes(payload)));

  let actualMac: Uint8Array;
  try {
    actualMac = toU8(aesjs.utils.hex.toBytes(macHex));
  } catch {
    return null;
  }
  if (!timingSafeEqual(expectedMac, actualMac)) return null;

  try {
    const decrypted = aesCtr(encKey, aesjs.utils.hex.toBytes(nonceHex)).decrypt(aesjs.utils.hex.toBytes(cipherHex));
    return aesjs.utils.utf8.fromBytes(decrypted);
  } catch {
    return null;
  }
}

/** v1(레거시) 포맷 복호화 — MAC이 없어 변조를 검출할 수 없다. v2로 재저장되면 더 이상 쓰이지 않는다. */
function decryptV1(value: string, rootKey: Uint8Array): string | null {
  const [nonceHex, cipherHex] = value.split('.');
  if (!nonceHex || !cipherHex) return null;
  try {
    const decrypted = aesCtr(rootKey, aesjs.utils.hex.toBytes(nonceHex)).decrypt(aesjs.utils.hex.toBytes(cipherHex));
    return aesjs.utils.utf8.fromBytes(decrypted);
  } catch {
    return null;
  }
}

/**
 * Supabase storage adapter. The encrypted session is kept in AsyncStorage while
 * the per-key AES-256 root secret stays in OS-backed SecureStore; v2 derives
 * separate encryption/MAC subkeys from it via HKDF so ciphertext tampering is
 * detected before any bytes are trusted. Legacy plaintext and v1 (unauthenticated
 * CTR, no MAC) sessions are migrated to v2 on their first successful read.
 */
export const secureAuthStorage = {
  async getItem(key: string) {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;

    const keyName = secureKeyName(key);
    const existingRootKey = await SecureStore.getItemAsync(keyName, SECURE_STORE_OPTIONS);
    if (!existingRootKey) {
      // One-time migration from the original plaintext AsyncStorage adapter.
      await secureAuthStorage.setItem(key, stored);
      return stored;
    }

    const rootKey = toU8(aesjs.utils.hex.toBytes(existingRootKey));
    const isV2 = stored.startsWith('v2.');
    const plaintext = isV2 ? decryptV2(stored, rootKey) : decryptV1(stored, rootKey);

    if (plaintext === null) {
      // Tampered, corrupted, or an unrecognized version tag — never trust partial output.
      await secureAuthStorage.removeItem(key);
      return null;
    }

    if (!isV2) {
      // Transparent v1 -> v2 upgrade so tamper detection applies from here on.
      await secureAuthStorage.setItem(key, plaintext);
    }
    return plaintext;
  },

  async setItem(key: string, value: string) {
    const rootKey = await getOrCreateRootKey(key);
    await AsyncStorage.setItem(key, encryptV2(value, rootKey));
  },

  async removeItem(key: string) {
    await Promise.all([
      AsyncStorage.removeItem(key),
      SecureStore.deleteItemAsync(secureKeyName(key), SECURE_STORE_OPTIONS),
    ]);
  },
};
