-- 카테고리 채우기 배치 1차 (2026-09-03, 운영자 승인).
-- consonant/kpop/reels/drama/outdated-slang/variety/work/daily 부족 카테고리를
-- 최소 10개까지 채우려는 조사·검수 파이프라인의 첫 배치. 32개 후보 중 출처가
-- 1개뿐인 6개(ㅊㅋ/브이로그/얼짱/캡짱/훈남/케미)는 운영자 요청으로 이번엔 제외,
-- native_review_pending으로 남겨 추가 검토 예정. 원문은 slang_candidates.draft_payload 참고.
--
-- NOTE: filename timestamp matches the production migration version
-- (MCP apply time) — repo-wide convention, see CLAUDE.md.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (147 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where status = 'native_review_pending'
    and term not in ('ㅊㅋ','브이로그','얼짱','캡짱','훈남','케미')
) t
order by created_at;

update public.slang_candidates
set status = 'published'
where status = 'native_review_pending'
  and term not in ('ㅊㅋ','브이로그','얼짱','캡짱','훈남','케미');

commit;

-- 적용 후 확인: select count(*) from public.words; → 65
