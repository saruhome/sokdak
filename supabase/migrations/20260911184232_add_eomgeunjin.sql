-- 엄근진 추가 (2026-09-11, 운영자 지시).
-- '엄격·근엄·진지'의 줄임말, 과한 진지함을 놀리는 무해한 인터넷 밈.

begin;

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (467 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where term = '엄근진' and status = 'published'
) t;

commit;

-- 적용 후 확인: select count(*) from public.words; → 385
