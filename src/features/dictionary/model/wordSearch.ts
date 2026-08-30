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

/* ponytail: O(n·m²) 레벤슈타인 전수 비교 — 사전이 수천 단어가 되면 초성/자모 인덱스로 교체 */
function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = a[i - 1] === b[j - 1] ? diagonal : Math.min(diagonal, prev[j], prev[j - 1]) + 1;
      diagonal = prev[j];
      prev[j] = next;
    }
  }
  return prev[b.length];
}

/**
 * 오타·유사 검색어에 대해 "혹시 이 단어인가요?" 후보를 하나 고른다.
 * 표제어(한글 음절 단위)와 로마자(정규화) 양쪽에서 편집 거리가 가장 가까운 단어를
 * 길이 비례 허용치(짧은 검색어 1, 긴 검색어 2) 안에서 반환한다. 없으면 null.
 */
export function suggestSimilarWord(words: Word[], query: string): Word | null {
  const normalized = normalizeWordSearchText(query);
  if (normalized.length < 2) return null;

  let best: { word: Word; distance: number } | null = null;
  for (const word of words) {
    const candidates = [normalizeWordSearchText(word.word), normalizeWordSearchText(word.romanization)];
    for (const candidate of candidates) {
      if (!candidate) continue;
      const allowed = Math.min(candidate.length, normalized.length) <= 4 ? 1 : 2;
      const distance = editDistance(candidate, normalized);
      if (distance === 0 || distance > allowed) continue;
      if (!best || distance < best.distance) best = { word, distance };
    }
  }
  return best?.word ?? null;
}
