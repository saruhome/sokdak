import type { Word } from '@/constants/words';
import { normalizeWordSearchText, wordMatchesSearch } from '@/constants/wordSearch';

const sampleWord = {
  id: 'sample',
  word: 'ㄹㅇ',
  romanization: 'Ri-Eol',
  category: 'frequently-used',
  secondaryCategory: 'daily-life',
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
    { lang: '🇩🇪 DE', text: 'Echt / im Ernst' },
  ],
} as Word;

const untranslatedWord = {
  ...sampleWord,
  id: 'untranslated',
  word: '신조어',
  romanization: 'Sin-Jo-Eo',
  shortDesc: '새로 생긴 말',
  category: 'new-slang',
  secondaryCategory: undefined,
  translations: [],
} as Word;

describe('wordMatchesSearch', () => {
  it.each([
    ['한국어 표제어', 'ㄹㅇ'],
    ['한국어 짧은 설명', '진짜'],
    ['주 카테고리', 'frequently'],
    ['보조 카테고리', 'daily life'],
  ])('%s의 부분 일치를 찾는다', (_label, query) => {
    expect(wordMatchesSearch(sampleWord, query)).toBe(true);
  });

  it.each([
    'Ri-Eol',
    'ri eol',
    'RIEOL',
    '  ri - eol  ',
    'Ｒｉ－Ｅｏｌ',
  ])('로마자 변형 입력 %p을 같은 표기로 취급한다', query => {
    expect(wordMatchesSearch(sampleWord, query)).toBe(true);
  });

  it.each([
    ['영어 번역의 앞부분', 'for real'],
    ['영어 번역의 중간 부분', 'serious'],
    ['일본어 번역의 부분', 'マジ'],
    ['베트남어 번역의 원문', 'tuyệt vời'],
    ['베트남어 번역의 무악센트 표기', 'tuyet voi'],
    ['스페인어 번역의 원문', 'qué increíble'],
    ['스페인어 번역의 무악센트 표기', 'que increible'],
    ['독일어 번역의 원문', 'im Ernst'],
  ])('%s을 검색한다', (_label, query) => {
    expect(wordMatchesSearch(sampleWord, query)).toBe(true);
  });

  it('번역의 lang 표시값 형식과 무관하게 text를 검색한다', () => {
    const customLanguageLabel = {
      ...sampleWord,
      translations: [{ lang: 'custom-display-label', text: 'Voice-first slang' }],
    } as Word;

    expect(wordMatchesSearch(customLanguageLabel, 'voice first')).toBe(true);
  });

  it('번역이 비어 있어도 한국어·로마자 검색은 정상 동작한다', () => {
    expect(wordMatchesSearch(untranslatedWord, '신조')).toBe(true);
    expect(wordMatchesSearch(untranslatedWord, 'sin jo eo')).toBe(true);
    expect(wordMatchesSearch(untranslatedWord, 'voice first')).toBe(false);
  });

  it.each(['   ', '\n\t', ''])('빈 검색어 %p는 모든 단어를 포함한다', query => {
    expect(wordMatchesSearch(sampleWord, query)).toBe(true);
  });

  it.each([
    'unrelated term',
    'マジではない',
    'completelydifferent',
  ])('부분 일치하지 않는 검색어 %p는 제외한다', query => {
    expect(wordMatchesSearch(sampleWord, query)).toBe(false);
  });
});

describe('normalizeWordSearchText', () => {
  it.each([
    ['Qué-Increíble', 'queincreible'],
    ['T-M-I', 'tmi'],
    ['  For / Real  ', 'forreal'],
    ['Thật sự tuyệt vời', 'thatsutuyetvoi'],
    ['Đúng rồi', 'dungroi'],
    ['Ähnliche Wörter', 'ahnlicheworter'],
    ['Ｒｉ－Ｅｏｌ', 'rieol'],
  ])('%p를 %p로 정규화한다', (input, expected) => {
    expect(normalizeWordSearchText(input)).toBe(expected);
  });
});

// 'TMI'와 '티엠아이'처럼 한 단어를 두 표기로 쓰는 경우, 표제어를 나누지 않고 aliases로만 검색에
// 태운다. 두 표기 모두 같은 항목 하나에 걸려야 한다.
describe('별칭(aliases) 검색', () => {
  const tmi = {
    ...sampleWord,
    id: 'tmi',
    word: 'TMI',
    romanization: 'Ti-em-a-i',
    aliases: ['티엠아이'],
    shortDesc: '너무 많거나 불필요한 정보',
    translations: [],
  } as Word;

  it.each(['TMI', 'tmi', '티엠아이'])('표기 %p로 검색해도 같은 항목이 걸린다', query => {
    expect(wordMatchesSearch(tmi, query)).toBe(true);
  });

  it('별칭에 없는 표기는 걸리지 않는다', () => {
    expect(wordMatchesSearch(tmi, '존맛탱')).toBe(false);
  });

  it('aliases가 없는 단어도 그대로 동작한다', () => {
    expect(wordMatchesSearch(sampleWord, 'ㄹㅇ')).toBe(true);
    expect(wordMatchesSearch(sampleWord, '티엠아이')).toBe(false);
  });
});
