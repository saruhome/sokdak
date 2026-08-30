/** 신조어 제안 실데이터 접근 계층 — Supabase `word_suggestions` 테이블.
 * 운영팀 검토 후 사전 반영은 수동(Supabase 대시보드) — reports와 동일한 패턴. */
import { supabase } from '../../../shared/api/supabaseClient';

export async function submitWordSuggestion(params: {
  word: string;
  /* 카테고리·뜻은 선택 — 단어만 알아도 제안 가치가 있다(운영 결정 2026-08-30) */
  categorySlug?: string | null;
  definition?: string;
  example?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요해요.' };

  const { error } = await supabase.from('word_suggestions').insert({
    user_id: user.id,
    word: params.word,
    category_slug: params.categorySlug || null,
    definition: params.definition || null,
    example: params.example || null,
  });
  return { error: error?.message ?? null };
}
