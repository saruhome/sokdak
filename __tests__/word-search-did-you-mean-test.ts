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

describe('snapTranscriptToWord — 음성 전사 스냅 (외국인 발음 보정)', () => {
  const { snapTranscriptToWord } = require('../src/features/dictionary/model/wordSearch');
  const CANDIDATES = ['야르', '킹받다', '갑분싸'];

  it('정규화 완전 일치 대안이 있으면 그 표제어를 고른다', () => {
    expect(snapTranscriptToWord(['킹 받다'], CANDIDATES)).toBe('킹받다');
  });

  it("부정확한 발음은 가장 가까운 표제어로 스냅한다 ('야루' → '야르')", () => {
    expect(snapTranscriptToWord(['야루'], CANDIDATES)).toBe('야르');
  });

  it('뒤쪽 대안이 사전 단어와 일치하면 그 대안을 쓴다', () => {
    expect(snapTranscriptToWord(['카브サ', '갑분싸'], CANDIDATES)).toBe('갑분싸');
  });

  it('사전과 동떨어진 전사는 원문 그대로 돌려준다', () => {
    expect(snapTranscriptToWord(['안녕하세요 반갑습니다'], CANDIDATES)).toBe('안녕하세요 반갑습니다');
  });
});
