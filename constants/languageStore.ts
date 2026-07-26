import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'sokdak.language';
export type Language = 'ko' | 'en';

type TranslationKey =
  | 'home'
  | 'category'
  | 'dictionary'
  | 'community'
  | 'mypage'
  | 'settings'
  | 'notifications'
  | 'languageSettings'
  | 'activity'
  | 'savedWords'
  | 'likedPosts'
  | 'myActivity'
  | 'suggestNewSlang'
  | 'loginNeeded'
  | 'tapToLogin'
  | 'startWithSokdak'
  | 'loginPrompt'
  | 'termsOfService'
  | 'privacyPolicy'
  | 'logout'
  | 'login'
  | 'saveWordCount'
  | 'likesCount'
  | 'loginBannerSubtitle';

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = {
  ko: {
    home: '홈',
    category: '카테고리',
    dictionary: '사전',
    community: '커뮤니티',
    mypage: '마이페이지',
    settings: '설정',
    notifications: '알림설정',
    languageSettings: '언어 설정',
    activity: '활동',
    savedWords: '저장한 단어',
    likedPosts: '좋아요 한 글',
    myActivity: '내 활동',
    suggestNewSlang: '신조어 제안하기',
    loginNeeded: '로그인이 필요해요',
    tapToLogin: '탭하여 로그인 →',
    startWithSokdak: '속닥과 함께 시작해요!',
    loginPrompt: '로그인하면 단어 저장·커뮤니티 이용 가능',
    termsOfService: '이용약관',
    privacyPolicy: '개인정보처리방침',
    logout: '로그아웃',
    login: '로그인하기',
    saveWordCount: '저장한 단어',
    likesCount: '좋아요',
    loginBannerSubtitle: '로그인하면 단어 저장·커뮤니티 이용 가능',
  },
  en: {
    home: 'Home',
    category: 'Category',
    dictionary: 'Dictionary',
    community: 'Community',
    mypage: 'My Page',
    settings: 'Settings',
    notifications: 'Notifications',
    languageSettings: 'Language Settings',
    activity: 'Activity',
    savedWords: 'Saved Words',
    likedPosts: 'Liked Posts',
    myActivity: 'My Activity',
    suggestNewSlang: 'Suggest New Slang',
    loginNeeded: 'Login required',
    tapToLogin: 'Tap to login →',
    startWithSokdak: 'Start with Sokdak!',
    loginPrompt: 'Login to save words and use the community',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    login: 'Login',
    saveWordCount: 'Saved words',
    likesCount: 'Likes',
    loginBannerSubtitle: 'Login to save words and use the community',
  },
};

let _language: Language = 'ko';
let _initialized = false;
let _initPromise: Promise<void> | null = null;
const _listeners = new Set<(language: Language) => void>();

async function loadLanguage() {
  try {
    const raw = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (raw === 'en' || raw === 'ko') {
      _language = raw;
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
    if (lang !== 'ko' && lang !== 'en') return;
    _language = lang;
    persistLanguage();
    _listeners.forEach(fn => fn(_language));
  },
  subscribe: (fn: (language: Language) => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
  t: (key: TranslationKey) => TRANSLATIONS[_language][key],
};
