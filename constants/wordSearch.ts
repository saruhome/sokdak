import type { Word } from '@/constants/words';

/**
 * 검색 입력과 단어 메타데이터를 비교하기 위한 정규화 함수.
 *
 * 라틴 문자 입력은 대소문자·악센트·공백·하이픈 차이를 무시한다.
 * 따라서 `Ri Eol`, `ri-eol`, `rieol`은 같은 로마자 검색으로 취급하며,
 * 스페인어·베트남어 번역은 악센트를 생략해도 찾을 수 있다.
 */
export function normalizeWordSearchText(value: string): string {
  return value
    .normalize('NFD')
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[\s\-_'’.,/()]+/g, '');
}

function getSearchableFields(word: Word): string[] {
  return [
    word.word,
    word.romanization,
    word.shortDesc,
    word.category,
    word.secondaryCategory ?? '',
    ...word.translations.map(translation => translation.text),
  ];
}

/**
 * 한국어 표제어·짧은 설명·카테고리·로마자·모든 등록 번역본에서 부분 일치를 찾는다.
 * 번역 `lang` 값은 표시용 메타데이터이므로 국가 이모지나 표기 형식과 관계없이 text를 검색한다.
 */
export function wordMatchesSearch(word: Word, query: string): boolean {
  const normalizedQuery = normalizeWordSearchText(query);
  if (!normalizedQuery) return true;

  return getSearchableFields(word).some(field =>
    normalizeWordSearchText(field).includes(normalizedQuery),
  );
}
