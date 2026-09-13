-- '월급 루팡'(244)과 '월급루팡'(314) 중복 표제어 병합 (2026-09-13, 운영자 지시).
-- 띄어쓰기만 다른 같은 말이라 표제어 규칙(CLAUDE.md)에 따라 하나로 합친다.
-- 표제어는 띄어 쓴 '월급 루팡'(244): 최근 언론(서울신문 2025-02-13 '월급 루팡 잡아라',
-- 한국경제 2024-03-26 '직장인 2명 중 1명은 월급 루팡')과 나무위키 표제가 띄어 쓰고,
-- 244가 먼저 등록돼 내용(월루 줄임말·2011 유래)이 더 풍부하며 dailyPicks '월루' 문장도 244에 연결돼 있다.
-- 314는 aliases로 흡수 후 삭제. saved_words/word_views 참조는 0건이지만 안전하게 옮긴다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

update public.saved_words set word_id = '244' where word_id = '314'
  and not exists (select 1 from public.saved_words s where s.user_id = saved_words.user_id and s.word_id = '244');
delete from public.saved_words where word_id = '314';
update public.word_views set word_id = '244' where word_id = '314';

update public.words set
  aliases = array['월급루팡'],
  related_words = array['칼퇴', '사축'],
  meanings = jsonb_set(jsonb_set(meanings,
    '{0,definition}', to_jsonb((meanings->0->>'definition') || ' 띄어 쓴 ''월급 루팡''과 붙여 쓴 ''월급루팡''은 같은 말이다.')),
    '{0,definition_i18n}', (meanings->0->'definition_i18n') || jsonb_build_object(
      'en', (meanings->0->'definition_i18n'->>'en') || ' ''월급 루팡'' (spaced) and ''월급루팡'' (unspaced) are the same word.',
      'ja', (meanings->0->'definition_i18n'->>'ja') || '分かち書きした「월급 루팡」と続けて書く「월급루팡」は同じ語。',
      'es', (meanings->0->'definition_i18n'->>'es') || ' ''월급 루팡'' (con espacio) y ''월급루팡'' (sin espacio) son la misma palabra.',
      'vi', (meanings->0->'definition_i18n'->>'vi') || ' ''월급 루팡'' (có dấu cách) và ''월급루팡'' (viết liền) là cùng một từ.',
      'de', (meanings->0->'definition_i18n'->>'de') || ' ''월급 루팡'' (getrennt) und ''월급루팡'' (zusammen) sind dasselbe Wort.')),
  usage = usage || ' 띄어 쓰든 붙여 쓰든 검색하면 이 항목 하나로 나온다.',
  usage_i18n = usage_i18n || jsonb_build_object(
    'en', (usage_i18n->>'en') || ' Search it spaced or unspaced — both lead to this one entry.',
    'ja', (usage_i18n->>'ja') || '分かち書きしてもしなくても、検索するとこの項目ひとつに出る。',
    'es', (usage_i18n->>'es') || ' Búscala con o sin espacio: ambas llevan a esta misma entrada.',
    'vi', (usage_i18n->>'vi') || ' Tìm có hay không có dấu cách đều ra đúng mục này.',
    'de', (usage_i18n->>'de') || ' Ob getrennt oder zusammen gesucht — beides führt zu diesem einen Eintrag.')
where id = '244' and coalesce(aliases, '{}') = '{}';

update public.words set related_words = array_replace(related_words, '월급루팡', '월급 루팡')
where '월급루팡' = any(related_words);

delete from public.words where id = '314';

-- After apply: select word from public.words group by word having count(*) > 1; → 0 rows
