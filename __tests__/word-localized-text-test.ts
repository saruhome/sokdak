/** 단어 본문 다국어 폴백 계약 — localizedText (목록 짧은 설명·상세 의미/문화/팁 공용). */
import { localizedText } from '../src/features/dictionary/model/localizedText';

const i18n = { en: 'EN body', ja: 'JA body' };

it('ko UI는 항상 한국어 원문', () => {
  expect(localizedText('원문', i18n, 'ko')).toBe('원문');
});

it('UI 언어 번역이 있으면 그 언어, 없으면 en, en도 없으면 원문', () => {
  expect(localizedText('원문', i18n, 'ja')).toBe('JA body');
  expect(localizedText('원문', i18n, 'de')).toBe('EN body');
  expect(localizedText('원문', { ja: 'JA만' }, 'de')).toBe('원문');
  expect(localizedText('원문', undefined, 'en')).toBe('원문');
});
