import { supabase } from './supabaseClient';

/**
 * 단어 사용 로그 — fire-and-forget. 실패해도 화면 흐름에 영향 주지 않는다
 * (INSERT 전용 테이블, 집계는 운영자가 Studio에서 word_stats 뷰로 조회).
 */
const SOURCES = ['search', 'home', 'category', 'dictionary', 'related', 'other'] as const;
export type WordViewSource = (typeof SOURCES)[number];

/** source는 라우트 파라미터 등 임의 문자열이 올 수 있어 여기서 정규화한다 (DB check 제약과 동일 목록). */
export function logWordView(wordId: string, source?: string) {
  const safe: WordViewSource = (SOURCES as readonly string[]).includes(source ?? '')
    ? (source as WordViewSource)
    : 'other';
  void supabase.from('word_views').insert({ word_id: wordId, source: safe }).then(
    () => {},
    () => {},
  );
}

export function logSearch(query: string, resultIds: string[]) {
  void supabase.from('search_events').insert({ query, result_ids: resultIds }).then(
    () => {},
    () => {},
  );
}
