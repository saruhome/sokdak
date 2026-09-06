-- 멘헤라(270) origin 오타 수정 (2026-09-06, 운영자 지시).
-- '메ン탈헬스' — 두 번째 글자가 한글 '멘'이 아니라 가타카나 'ン'으로 섞여 들어갔다.
-- 수집 단계 draft_payload에 있던 오타가 그대로 승격된 것이라, 20260906090000 마이그레이션의
-- 적용본을 고치지 않고 별도 UPDATE로 남긴다(적용 이력 보존).
-- 다른 컬럼·다른 단어에는 같은 오타 없음(전수 확인).

begin;

update public.words
   set origin = replace(origin, '메ン탈헬스', '멘탈 헬스')
 where id = '270';

commit;

-- 적용 후 확인: select count(*) from public.words where origin like '%메ン%'; → 0
