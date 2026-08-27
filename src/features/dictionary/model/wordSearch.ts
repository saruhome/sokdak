import type { Word } from '../api/wordsApi';

export type WordSearchMatch =
  | { field: 'word' | 'romanization' | 'shortDesc' | 'category' | 'secondaryCategory' }
  | { field: 'translation'; translation: Word['translations'][number] };

/**
 * 검색 입력과 단어 메타데이터를 비교하기 위한 정규화 함수.
 *
 * 라틴 문자 입력은 대소문자·악센트·공백·하이픈·전각 표기 차이를 무시한다.
 * 따라서 `Ri Eol`, `ri-eol`, `rieol`은 같은 로마자 검색으로 취급하며,
 * 스페인어·베트남어 번역은 악센트를 생략해도 찾을 수 있다.
 */
export function normalizeWordSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[\s\-_'’.,/()]+/g, '');
}

function includesNormalizedSearchText(value: string, normalizedQuery: string) {
  return normalizeWordSearchText(value).includes(normalizedQuery);
}

/**
 * 검색어와 처음 일치한 단어 메타데이터 필드를 반환한다.
 * 화면은 번역 의미가 일치한 경우에만 그 근거를 표시해, 외국어 사용자가 검색 결과의
 * 이유를 이해하도록 돕는다. 빈 검색어는 전체 목록을 보여 주는 상태이므로 근거가 없다.
 */
export function getWordSearchMatch(word: Word, query: string): WordSearchMatch | null {
  const normalizedQuery = normalizeWordSearchText(query);
  if (!normalizedQuery) return null;

  const primaryFields: Array<[Exclude<WordSearchMatch['field'], 'translation'>, string]> = [
    ['word', word.word],
    ['romanization', word.romanization],
    ['shortDesc', word.shortDesc],
    ['category', word.category],
    ['secondaryCategory', word.secondaryCategory ?? ''],
  ];

  const primaryMatch = primaryFields.find(([, value]) => includesNormalizedSearchText(value, normalizedQuery));
  if (primaryMatch) return { field: primaryMatch[0] };

  const translation = word.translations.find(candidate =>
    includesNormalizedSearchText(candidate.text, normalizedQuery),
  );
  return translation ? { field: 'translation', translation } : null;
}

/**
 * 한국어 표제어·짧은 설명·카테고리·로마자·모든 등록 번역본에서 부분 일치를 찾는다.
 * 번역 `lang` 값은 표시용 메타데이터이므로 국가 이모지나 표기 형식과 관계없이 text를 검색한다.
 */
export function wordMatchesSearch(word: Word, query: string): boolean {
  return getWordSearchMatch(word, query) !== null || !normalizeWordSearchText(query);
}
