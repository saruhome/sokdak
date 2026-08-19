import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as aesjs from 'aes-js';
import 'react-native-get-random-values';

const KEY_PREFIX = 'sokdak.auth.encryption-key.';
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

function secureKeyName(key: string) {
  return `${KEY_PREFIX}${key}`;
}

function newEncryptionKey() {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
}

async function getEncryptionKey(storageKey: string) {
  const keyName = secureKeyName(storageKey);
  const current = await SecureStore.getItemAsync(keyName, SECURE_STORE_OPTIONS);
  if (current) return aesjs.utils.hex.toBytes(current);

  const next = newEncryptionKey();
  await SecureStore.setItemAsync(keyName, aesjs.utils.hex.fromBytes(next), SECURE_STORE_OPTIONS);
  return next;
}

function encrypt(value: string, key: Uint8Array) {
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonce));
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
  return `${aesjs.utils.hex.fromBytes(nonce)}.${aesjs.utils.hex.fromBytes(encrypted)}`;
}

function decrypt(value: string, key: Uint8Array) {
  const [nonceHex, cipherHex] = value.split('.');
  if (!nonceHex || !cipherHex) return null;
  const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(aesjs.utils.hex.toBytes(nonceHex)));
  const decrypted = cipher.decrypt(aesjs.utils.hex.toBytes(cipherHex));
  return aesjs.utils.utf8.fromBytes(decrypted);
}

/**
 * Supabase storage adapter. The encrypted session is kept in AsyncStorage while
 * the per-key AES-256 key stays in OS-backed SecureStore. Existing plaintext
 * sessions are migrated on their first successful read.
 */
export const secureAuthStorage = {
  async getItem(key: string) {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;

    const keyName = secureKeyName(key);
    const existingKey = await SecureStore.getItemAsync(keyName, SECURE_STORE_OPTIONS);
    if (!existingKey) {
      // One-time migration from the previous plaintext AsyncStorage adapter.
      await secureAuthStorage.setItem(key, stored);
      return stored;
    }

    try {
      return decrypt(stored, aesjs.utils.hex.toBytes(existingKey));
    } catch {
      await secureAuthStorage.removeItem(key);
      return null;
    }
  },

  async setItem(key: string, value: string) {
    const encryptionKey = await getEncryptionKey(key);
    await AsyncStorage.setItem(key, encrypt(value, encryptionKey));
  },

  async removeItem(key: string) {
    await Promise.all([
      AsyncStorage.removeItem(key),
      SecureStore.deleteItemAsync(secureKeyName(key), SECURE_STORE_OPTIONS),
    ]);
  },
};
