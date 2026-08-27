/** 호환 facade — 실제 구현은 src/features/auth/model/authStore.ts (auth feature 분리 완료). */
export {
  authStore,
  BETA_UNLIMITED_ENTITLEMENTS,
  FREE_CATEGORY_LIKE_LIMIT,
  FREE_TTS_DAILY_LIMIT,
  FREE_WORD_SAVE_LIMIT,
  type SokDakUser,
  type NotificationPrefs,
} from '../src/features/auth/model/authStore';
