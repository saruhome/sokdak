-- 운영자 지시 단어 16개 추가 (2026-09-03).
-- 종나(존나 변형)/씹선비는 비속어 유래라 slang 카테고리 + [비속어·욕설] 경고.
-- 나머지 14개는 무해한 일상·게임·릴스 유행어. 자강두찐은 원형 자강두천의
-- 장난스러운 변형(특정 대상 비하 아님).
--
-- NOTE: 이 내용은 execute_sql로 슬랭 후보 삽입 → apply_migration으로
-- words 승격을 나눠 적용했고, 이 파일은 apply_migration 트랜잭션
-- (production version 20260903224115)만 담는다. 앞선 slang_candidates
-- INSERT는 별도 execute_sql 호출로 이미 적용된 상태였다.

begin;

update public.slang_candidates
set status = 'published'
where term in ('날티','뇌지컬','개미쳤다','불금','종나','가성비','갓성비','씹선비','찹추','찐막','자강두찐','선빵','선빵필승','심쿵','쌈뽕','뚠뚠이')
  and status = 'native_review_pending';

insert into public.words (id, word, romanization, category, short_desc, short_desc_i18n, pronunciation, meanings, origin, origin_i18n, usage, usage_i18n, related_words, likes, saves, translations)
select
  (198 + row_number() over (order by created_at))::text,
  dp->>'word', dp->>'romanization', dp->>'category', dp->>'short_desc', dp->'short_desc_i18n',
  dp->>'pronunciation', dp->'meanings', dp->>'origin', dp->'origin_i18n', dp->>'usage', dp->'usage_i18n',
  array(select jsonb_array_elements_text(dp->'related_words')), 0, 0, dp->'translations'
from (
  select draft_payload as dp, created_at
  from public.slang_candidates
  where term in ('날티','뇌지컬','개미쳤다','불금','종나','가성비','갓성비','씹선비','찹추','찐막','자강두찐','선빵','선빵필승','심쿵','쌈뽕','뚠뚠이')
    and status = 'published'
) t
order by created_at;

commit;

-- 적용 후 확인: select count(*) from public.words; → 143
