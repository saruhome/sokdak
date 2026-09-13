/** 오타 검색 "혹시 이 단어인가요?" 후보 선정 계약 — suggestSimilarWord. */
import { suggestSimilarWord } from '../src/features/dictionary/model/wordSearch';
import type { Word } from '../src/features/dictionary/api/wordsApi';

const w = (word: string, romanization: string): Word => ({
  id: word, word, romanization, category: 'daily', shortDesc: '', usage: '',
  meanings: [], relatedWords: [], likes: 0, saves: 0, translations: [],
});

const WORDS = [w('킹받다', 'King-Bat-Da'), w('갑분싸', 'Gap-Bun-Ssa'), w('ㄹㅇ', 'Ri-Eol')];

it('한 글자 오타를 가장 가까운 표제어로 추천한다', () => {
  expect(suggestSimilarWord(WORDS, '킹박다')?.word).toBe('킹받다');
  expect(suggestSimilarWord(WORDS, '갑분사')?.word).toBe('갑분싸');
});

it('로마자 오타도 추천한다 (정규화: 대소문자·하이픈 무시)', () => {
  expect(suggestSimilarWord(WORDS, 'kingbatta')?.word).toBe('킹받다');
});

it('정확히 일치(부분 일치로 이미 검색됨)나 동떨어진 검색어는 추천하지 않는다', () => {
  expect(suggestSimilarWord(WORDS, '킹받다')).toBeNull();
  expect(suggestSimilarWord(WORDS, '전혀다른말')).toBeNull();
  expect(suggestSimilarWord(WORDS, 'ㅋ')).toBeNull(); // 너무 짧은 검색어
});

it("모음 오타도 추천한다 — 외국인이 '야르'를 '야루'로 검색 (운영자 사례 2026-09-13)", () => {
  const words = [...WORDS, w('야르', 'Ya-Reu')];
  expect(suggestSimilarWord(words, '야루')?.word).toBe('야르');
  expect(suggestSimilarWord(words, 'yaru')?.word).toBe('야르');
});
