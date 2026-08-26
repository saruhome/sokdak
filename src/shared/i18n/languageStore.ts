/**
 * 언어 상태·persistence·번역 조회. locale 리소스는 ./locales/*로 분리되어 있고,
 * 이 모듈은 상태 관리와 t()/tFor()/useLanguage()만 담당한다.
 * 기존 constants/languageStore.ts는 이 모듈의 re-export facade로 유지된다.
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES, type Language, type TranslationKey } from './keys';
import { ko } from './locales/ko';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { vi } from './locales/vi';
import { es } from './locales/es';
import { de } from './locales/de';

export type { Language, TranslationKey };

const LANGUAGE_KEY = 'sokdak.language';

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = { ko, en, ja, vi, es, de };

let _language: Language = 'ko';
let _initialized = false;
let _initPromise: Promise<void> | null = null;
const _listeners = new Set<(language: Language) => void>();

async function loadLanguage() {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(raw as Language)) {
      _language = raw as Language;
    }
  } catch {
    _language = 'ko';
  }
}

async function persistLanguage() {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, _language);
  } catch {
    // ignore write errors
  }
}

export const languageStore = {
  initialize() {
    if (_initPromise) return _initPromise;
    _initPromise = (async () => {
      await loadLanguage();
      _initialized = true;
    })();
    return _initPromise;
  },
  isInitialized: () => _initialized,
  getLanguage: () => _language,
  setLanguage: (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    _language = lang;
    persistLanguage();
    _listeners.forEach(fn => fn(_language));
  },
  subscribe: (fn: (language: Language) => void) => {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
  t: (key: TranslationKey) => TRANSLATIONS[_language][key],
};

/** languageStore.t()와 달리 전역 상태와 무관하게 특정 언어로 바로 조회 — 이미 language 값을
 *  파라미터로 들고 있는 헬퍼 함수(getBoardLabel 등)에서 전역 상태를 건드리지 않고 쓰기 위함 */
export function tFor(language: Language, key: TranslationKey): string {
  return TRANSLATIONS[language][key];
}

/** 화면마다 반복되던 "초기화 + 구독" 보일러플레이트를 하나로 — 언어가 바뀌면 리렌더된다 */
export function useLanguage(): Language {
  const [language, setLanguage] = useState(languageStore.getLanguage());
  useEffect(() => {
    languageStore.initialize().then(() => setLanguage(languageStore.getLanguage()));
    const unsub = languageStore.subscribe(setLanguage);
    return () => { unsub(); };
  }, []);
  return language;
}
