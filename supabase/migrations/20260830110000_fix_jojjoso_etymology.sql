-- '좋좋소' 어원 재검증에 따른 전면 재작성 (2026-08-30). 데이터만 변경.
-- 기존 항목은 "'좋은 게 좋은 소리'의 약어"라는 잘못된 어원 위에 정의·예문까지
-- 지어져 있었다. 검증 결과(나무위키·비즈한국·미디어오늘 등): '좋좋소'는 웹드라마
-- '좋좋소'(2021, 이과장 채널, 빠니보틀 연출) 제목 "좋소 좋소 좋소기업"의 줄임말로,
-- 중소기업을 비하하는 거친 은어('좆소')의 발음을 순화해 쓴 풍자 표현이다.
--
-- 분류 판단: 표면형 '좋좋소'는 드라마 제목으로 뉴스·인터뷰에 그대로 쓰이는
-- 방송 안전 표현이라 프리미엄 slang(욕설·19금) 카테고리로 옮기지 않는다.
-- origin 서술도 원 비속어를 직접 표기하지 않고 "거친 은어의 순화"로만 언급한다.
-- outdated-slang(주) + work(secondary) 분류 유지.

begin;

update public.words set
  short_desc = '열악한 중소기업을 풍자적으로 이르는 말',
  usage = '직장인 커뮤니티에서 급여·복지·체계가 열악한 중소기업 생활을 자조·풍자할 때 사용.',
  origin = '웹드라마 ''좋좋소''(2021, 이과장 채널)의 제목 ''좋소 좋소 좋소기업''의 줄임 — 중소기업을 비하하는 거친 은어의 발음을 순화한 풍자 표현',
  meanings = '[
    {
      "type": "명사",
      "definition": "급여·복지·업무 체계가 열악한 중소기업을 풍자적으로 이르는 말.",
      "examples": [
        {"kor": "우리 회사 완전 좋좋소야.", "eng": "My company is a total johjohso — a shabby small company."},
        {"kor": "좋좋소 탈출이 올해 목표야.", "eng": "Escaping this dead-end small company is my goal this year."}
      ]
    }
  ]'::jsonb
where word = '좋좋소';

commit;

-- 적용 후 확인:
--   select short_desc, left(origin, 40) from public.words where word = '좋좋소';