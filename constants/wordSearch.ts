/** 호환 facade — 실제 구현은 src/features/dictionary/model/wordSearch.ts (dictionary feature 분리). */
export {
  normalizeWordSearchText,
  getWordSearchMatch,
  wordMatchesSearch,
  type WordSearchMatch,
} from '../src/features/dictionary/model/wordSearch';
