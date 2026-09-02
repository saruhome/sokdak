/**
 * 홈/카테고리/커뮤니티가 실제로 렌더링하는 핵심 라벨이 6개 locale 전부에서
 * 정의돼 있는지 고정한다 — 새 key가 일부 locale에만 추가되는 회귀 방지.
 */
import { ko } from '@/src/shared/i18n/locales/ko';
import { en } from '@/src/shared/i18n/locales/en';
import { ja } from '@/src/shared/i18n/locales/ja';
import { vi } from '@/src/shared/i18n/locales/vi';
import { es } from '@/src/shared/i18n/locales/es';
import { de } from '@/src/shared/i18n/locales/de';
import { tr } from '@/src/shared/i18n/locales/tr';
import type { Language, TranslationKey } from '@/src/shared/i18n/keys';

const LOCALES: Record<Language, Record<TranslationKey, string>> = { ko, en, ja, vi, es, de, tr };
const LANGUAGES: Language[] = ['ko', 'en', 'ja', 'vi', 'es', 'de', 'tr'];

const CORE_SCREEN_KEYS: TranslationKey[] = [
  // 홈
  'home', 'todayExpressionTitle', 'newSlangSection', 'moreLink', 'community', 'noPostsYet',
  // 카테고리
  'category', 'categorySearchPlaceholder', 'sortPopular', 'sortAlphabetical', 'a11yLikeCategory',
  // 커뮤니티
  'hotPosts', 'allLabel', 'writeTitle', 'postsLoadFailed', 'retryLabel',
  // 공통 헤더
  'a11yOpenSearch', 'a11yOpenNotifications',
];

describe('core screen labels exist in every locale', () => {
  it.each(LANGUAGES)('%s has every core key non-empty', language => {
    for (const key of CORE_SCREEN_KEYS) {
      const value = LOCALES[language][key];
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
