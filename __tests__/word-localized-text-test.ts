/** 단어 본문 다국어 폴백 계약 — localizedText (목록 짧은 설명·상세 의미/문화/팁 공용). */
import { cardGloss, localizedText } from '../src/features/dictionary/model/localizedText';

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

it('카드 글로스: translations 한 줄 대응어의 첫 구절, 없으면 본문 번역 폴백', () => {
  const w = { shortDesc: '긴 한국어 설명', shortDescI18n: { en: 'long EN body' },
    translations: [{ lang: '🇺🇸 EN', text: 'lol / haha' }, { lang: '🇯🇵 JA', text: 'しつこい繰り返し' }] };
  expect(cardGloss(w, 'ko')).toBe('긴 한국어 설명');
  expect(cardGloss(w, 'en')).toBe('lol');
  expect(cardGloss(w, 'ja')).toBe('しつこい繰り返し');
  expect(cardGloss({ shortDesc: '원문', shortDescI18n: { en: 'EN body' } }, 'de')).toBe('EN body');
});
