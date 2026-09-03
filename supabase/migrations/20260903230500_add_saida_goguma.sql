-- 사이다/고구마 추가 (2026-09-03, 운영자 지시).
-- 콘텐츠 전개 만족도를 가리키는 반의어 짝. 무해한 표현.

begin;

update public.slang_candidates
set status = 'published'
where term in ('사이다','고구마') and status = 'native_review_pending';

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (214 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where term in ('사이다','고구마') and status = 'published'
) t
order by created_at;

commit;

-- 적용 후 확인: select count(*) from public.words; → 145
