-- 출처 1개짜리 후보 6개 최종 승인 (2026-09-03, 운영자 승인).
-- ㅊㅋ/브이로그/얼짱/캡짱/훈남/케미 — 지난 배치에서 재확인 보류했던 항목들.
-- 원문은 slang_candidates.draft_payload 참고.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (173 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where status = 'native_review_pending'
    and term in ('ㅊㅋ','브이로그','얼짱','캡짱','훈남','케미')
) t
order by created_at;

update public.slang_candidates
set status = 'published'
where status = 'native_review_pending'
  and term in ('ㅊㅋ','브이로그','얼짱','캡짱','훈남','케미');

commit;

-- 적용 후 확인: select count(*) from public.words; → 71
