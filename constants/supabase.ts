import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { secureAuthStorage } from './secureAuthStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — check .env (see .env.example).',
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // secureAuthStorage의 키 보관소인 expo-secure-store는 웹 구현이 없어(호출 즉시
    // TypeError) 웹 로그인이 통째로 깨진다. 웹은 OS 키체인 자체가 없어 암호화 계층이
    // 성립하지 않으므로 표준대로 평문 AsyncStorage(=localStorage)를 쓴다.
    storage: Platform.OS === 'web' ? AsyncStorage : secureAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
