-- 카테고리 개편(b62d4e5, 18b0713)에 따른 단어 재분류 + UX 라이팅 일관성 수정.
-- 데이터만 변경, 스키마 무변경. 2026-08-30 운영자 승인.
--
-- 재분류:
--   work 신설: 넵병(daily→work), 스불재(new-slang→work).
--     좋좋소는 outdated-slang 유지 + secondary_category로 work에도 노출
--     (한물 간 카테고리가 비지 않도록 — 목록 필터는 secondary를 포함해 매칭).
--   variety(예능/TV쇼) 신설: 무야호 → variety (muhandoejeon 폐지).
--   new-slang 재정의(등록 후 3개월 내 재분류): 장수 인기어 TMI·갓생 → frequently-used.
-- 삭제:
--   '요즘 뭐 봐?' — 신조어가 아닌 일반 회화 문장이라 사전에서 제외 (저장 0건, FK CASCADE).
-- 표기 일관성(UX 라이팅 감사 B항):
--   ㅋㅋ romanization을 초성 3종 공통 규칙(원단어 발음)으로: K-K → Keu-Keu.
--   오빠 usage를 다른 30개와 같은 명사구 문체로, pronunciation을 한글 표기 형식으로.
--   직관 short_desc 조사 오류 수정 + 스포츠 직관 포함으로 확장.
--   레알 origin을 정설(레알 마드리드 유래) 하나로 정리.

begin;

update public.words set category = 'work' where word in ('넵병', '스불재');
update public.words set secondary_category = 'work' where word = '좋좋소';
update public.words set category = 'variety' where word = '무야호';
update public.words set category = 'frequently-used' where word in ('TMI', '갓생');

delete from public.words where word = '요즘 뭐 봐?';

update public.words set romanization = 'Keu-Keu' where word = 'ㅋㅋ';

update public.words set
  pronunciation = '[오-빠]',
  usage = '친오빠·연인·좋아하는 남자 연예인을 부르는 호칭으로 두루 사용. 공적인 자리나 낯선 사이에서는 오해 소지 주의.'
where word = '오빠';

update public.words set short_desc = '콘서트나 경기를 직접 가서 보는 것' where word = '직관';

update public.words set
  origin = '스페인 축구팀 레알 마드리드(Real Madrid)의 ''레알(real)'' 발음에서 유래해 ''진짜''라는 뜻으로 정착'
where word = '레알';

commit;

-- 적용 후 확인:
--   select category, count(*) from public.words group by category order by 2 desc;
--   → 총 30단어: muhandoejeon 0, variety 1, work 2(+좋좋소 secondary), frequently-used 4, drama 2.