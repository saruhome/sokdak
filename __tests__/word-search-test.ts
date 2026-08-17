import type { Word } from '@/constants/words';
import { normalizeWordSearchText, wordMatchesSearch } from '@/constants/wordSearch';

const sampleWord = {
  id: 'sample',
  word: 'ㄹㅇ',
  romanization: 'Ri-Eol',
  category: 'frequently-used',
  shortDesc: '진짜라는 뜻의 줄임말',
  meanings: [],
  usage: '',
  relatedWords: [],
  likes: 0,
  saves: 0,
  translations: [
    { lang: '🇺🇸 EN', text: 'For real / Seriously' },
    { lang: '🇯🇵 JA', text: 'リアル / マジで' },
    { lang: '🇻🇳 VI', text: 'Thật sự tuyệt vời' },
    { lang: '🇪🇸 ES', text: 'Qué increíble, de verdad' },
  ],
} as Word;

describe('wordMatchesSearch', () => {
  it('한국어 표제어와 짧은 설명의 부분 일치를 찾는다', () => {
    expect(wordMatchesSearch(sampleWord, 'ㄹㅇ')).toBe(true);
    expect(wordMatchesSearch(sampleWord, '진짜')).toBe(true);
  });

  it('로마자의 대소문자·공백·하이픈 차이를 무시한다', () => {
    expect(wordMatchesSearch(sampleWord, 'ri eol')).toBe(true);
    expect(wordMatchesSearch(sampleWord, 'RIEOL')).toBe(true);
  });

  it('영어와 일본어 번역 의미를 검색한다', () => {
    expect(wordMatchesSearch(sampleWord, 'serious')).toBe(true);
    expect(wordMatchesSearch(sampleWord, 'マジ')).toBe(true);
  });

  it('베트남어와 스페인어 번역은 악센트를 생략해도 검색한다', () => {
    expect(wordMatchesSearch(sampleWord, 'tuyet voi')).toBe(true);
    expect(wordMatchesSearch(sampleWord, 'que increible')).toBe(true);
  });

  it('빈 검색어는 모든 단어를 포함하고, 관련 없는 검색어는 제외한다', () => {
    expect(wordMatchesSearch(sampleWord, '   ')).toBe(true);
    expect(wordMatchesSearch(sampleWord, 'unrelated term')).toBe(false);
  });
});

describe('normalizeWordSearchText', () => {
  it('라틴 문자 악센트와 단어 구분자를 정규화한다', () => {
    expect(normalizeWordSearchText('Qué-Increíble')).toBe('queincreible');
    expect(normalizeWordSearchText('T-M-I')).toBe('tmi');
  });
});
