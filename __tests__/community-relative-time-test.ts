/** formatPostDate — 7일 이내는 접속 언어 상대시간, 그 이후는 로컬 날짜 표기 */
jest.mock('@/constants/supabase', () => ({ supabase: {} }));
jest.mock('@/constants/authStore', () => ({ authStore: { getBlockedUserIds: () => [] } }));

import { formatPostDate } from '@/src/features/community/api/communityApi';
import { languageStore } from '@/src/shared/i18n/languageStore';

const NOW = new Date('2026-09-02T12:00:00Z').getTime();
const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString();

describe('formatPostDate', () => {
  it('formats recent times as Korean relative time by default', () => {
    expect(formatPostDate(iso(3 * 60 * 1000), NOW)).toBe('3분 전');
    expect(formatPostDate(iso(2 * 3600 * 1000), NOW)).toBe('2시간 전');
    expect(formatPostDate(iso(24 * 3600 * 1000), NOW)).toBe('어제');
  });

  it('falls back to a localized date after 7 days', () => {
    const result = formatPostDate(iso(8 * 24 * 3600 * 1000), NOW);
    expect(result).toContain('2026');
    expect(result).not.toContain('전');
  });

  it('follows the app language, not the device locale', () => {
    languageStore.setLanguage('de');
    try {
      expect(formatPostDate(iso(3 * 60 * 1000), NOW)).toBe('vor 3 Minuten');
    } finally {
      languageStore.setLanguage('ko');
    }
  });

  it('keeps the raw date prefix for unparsable input', () => {
    expect(formatPostDate('not-a-date')).toBe('not-a-date');
  });
});
