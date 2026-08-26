/**
 * 유료 권한/무료 한도 도메인 — auth migration 4단계.
 * 프리미엄 여부는 서버(account_settings.is_premium)가 소스이고 sessionStore의 유저 스냅샷으로
 * 읽는다. 무료 한도 상수와 TTS 일일 카운터(기기 저장, 서버 강제 아님 — UX 가드)를 소유한다.
 * 저장 단어/카테고리 한도 판정에 필요한 "현재 개수"는 북마크 캐시(authStore 소유)에 있으므로
 * 호출부가 개수를 넘긴다 — 북마크 상태를 이 스토어로 끌고 오지 않기 위한 의도적 경계.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionStore } from './sessionStore';

/** ponytail: 무료 회원 저장 단어/좋아요 카테고리/TTS 일일 상한. 프리미엄은 무제한.
 *  실제 결제 연동 전까지는 클라이언트 상수 — 서버에서 강제하는 값이 아니라 UX 가드일 뿐이다. */
export const FREE_WORD_SAVE_LIMIT = 3;
export const FREE_CATEGORY_LIKE_LIMIT = 2;
export const FREE_TTS_DAILY_LIMIT = 3;
/** 결제가 비활성인 비공개 베타에서는 유료 제한·자동 삭제를 적용하지 않는다. */
export const BETA_UNLIMITED_ENTITLEMENTS = true;

/** 무료 회원 TTS 일일 재생 횟수 — 계정+날짜별로 기기에 저장(서버 강제 아님, UX 가드).
 *  ponytail: 세션이 자정을 넘겨 계속 켜져 있으면 갱신은 다음 recordTtsPlay/canPlayTtsToday
 *  호출 시점에 반영된다 — 실시간 자정 리셋 타이머는 만들지 않았다. */
let _ttsPlaysToday = 0;
let _ttsPlaysDate = '';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function ttsStorageKey(userId: string) {
  return `sokdak.tts.${userId}.${todayString()}`;
}

export const entitlementStore = {
  /** 베타 무제한 또는 실제 프리미엄 — 한도 판정의 공통 단락 조건. */
  hasUnlimited: () => BETA_UNLIMITED_ENTITLEMENTS || sessionStore.getUser()?.isPremium === true,

  isPremium: () => sessionStore.getUser()?.isPremium ?? false,

  /** 로그인/세션 복원 시 오늘의 TTS 재생 횟수를 기기에서 불러온다. */
  async loadTtsPlaysToday(userId: string) {
    const today = todayString();
    const raw = await AsyncStorage.getItem(ttsStorageKey(userId));
    _ttsPlaysToday = raw ? parseInt(raw, 10) || 0 : 0;
    _ttsPlaysDate = today;
  },

  resetTts() {
    _ttsPlaysToday = 0;
    _ttsPlaysDate = '';
  },

  /** 무료 회원 TTS 일일 재생 상한. 비로그인은 애초에 speakWord에서 로그인 요구로 막는다. */
  canPlayTtsToday: () => {
    const user = sessionStore.getUser();
    if (BETA_UNLIMITED_ENTITLEMENTS) return Boolean(user);
    if (user?.isPremium) return true;
    if (!user) return false;
    if (_ttsPlaysDate !== todayString()) return true; // 날짜가 바뀌었으면 아직 오늘 재생 없음
    return _ttsPlaysToday < FREE_TTS_DAILY_LIMIT;
  },

  recordTtsPlay() {
    const user = sessionStore.getUser();
    if (!user || user.isPremium || BETA_UNLIMITED_ENTITLEMENTS) return;
    const today = todayString();
    if (_ttsPlaysDate !== today) { _ttsPlaysDate = today; _ttsPlaysToday = 0; }
    _ttsPlaysToday += 1;
    AsyncStorage.setItem(ttsStorageKey(user.id), String(_ttsPlaysToday)).catch(() => {});
  },
};
