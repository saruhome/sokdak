/** 호환 facade — 실제 구현은 src/features/dictionary/api/wordsApi.ts (dictionary feature 분리). */
export { fetchWords, fetchWordsByIds, fetchWordById, isAdultOnlyWord, localizedText, type Word } from '../src/features/dictionary/api/wordsApi';
