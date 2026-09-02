-- 니애미/김치녀/스시녀/된장녀/탈룰라 추가 (2026-09-02, 운영자 승인).
-- native_review_pending → published 승격, 원문은 slang_candidates.draft_payload 참고.
-- 김치녀/스시녀/된장녀는 여성혐오·차별적 비하 표현 — short_desc 앞에
-- "[차별적 비하 표현]" 경고를 5개 언어로 병기(운영자 지시). 니애미는 패드립
-- 욕설로 젠더 이슈 없음. 탈룰라는 영화 '쿨러닝'(1993) 유래 무해한 신조어.
--
-- NOTE: filename timestamp matches the production migration version
-- (MCP apply time) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (142 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where term in ('니애미','김치녀','스시녀','된장녀','탈룰라') and status = 'native_review_pending'
) t
order by created_at;

update public.slang_candidates
set status = 'published'
where term in ('니애미','김치녀','스시녀','된장녀','탈룰라') and status = 'native_review_pending';

commit;

-- 적용 후 확인: select count(*) from public.words; → 39
