-- 운영자 지시 단어 12개 추가 (2026-09-03).
-- 존예/존잘/졸귀는 존맛탱/존버와 같은 계열(비속어 유래)이라 slang
-- 카테고리로 넣고 [비속어·욕설] 경고 병기. 나머지 9개는 무해한
-- 일상·방송·팬덤 유행어.
--
-- NOTE: 요청받은 13개 중 "뿌의 세계"는 출처를 찾지 못해 제외했다
-- (마이그레이션 파일명은 애초 13개 기준으로 지어 그대로 둠 — 실제
-- 반영은 12개).

begin;

update public.slang_candidates
set status = 'published'
where term in ('마라맛','흑우','모음zip','인생 연기','인생 맛집','국민 배우','국민 여동생','딸바보','딸천재')
  and status = 'native_review_pending';

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (186 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where term in ('존예','존잘','졸귀','마라맛','흑우','모음zip','인생 연기','인생 맛집','국민 배우','국민 여동생','딸바보','딸천재')
    and status = 'published'
) t
order by created_at;

commit;

-- 적용 후 확인: select count(*) from public.words; → 127
