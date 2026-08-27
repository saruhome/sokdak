/** 검색 화면의 결과 필터링 — 전부 순수 함수. 단어 매칭 규칙 자체는 dictionary feature
 * (wordSearch)가 소유하고, 여기서는 검색 화면의 조합(자동완성 상한/카테고리 필터/커뮤니티
 * 텍스트 매칭)만 담당한다. */
import type { Word } from '../../dictionary/api/wordsApi';
import { wordMatchesSearch } from '../../dictionary/model/wordSearch';
import type { CommunityPostSummary } from '../../../../constants/community';

/** 입력 중 자동완성 — 상위 N개만 (Figma: 229:2723) */
export function suggestWords(words: Word[], query: string, limit = 6): Word[] {
  const q = query.trim();
  if (!q) return [];
  return words.filter(w => wordMatchesSearch(w, q)).slice(0, limit);
}

/** 제출된 검색어의 단어 결과 + 선택적 카테고리 필터 (Figma: 229:2750/2772) */
export function filterWordResults(words: Word[], query: string, categorySlug: string | null): Word[] {
  const q = query.trim();
  let base = words.filter(w => wordMatchesSearch(w, q));
  if (categorySlug) base = base.filter(w => w.category === categorySlug);
  return base;
}

/** 커뮤니티 결과 — 제목/본문 대소문자 무시 부분 일치 (Figma: 229:2808) */
export function filterPostResults(posts: CommunityPostSummary[], query: string): CommunityPostSummary[] {
  const q = query.trim().toLowerCase();
  return posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
}
