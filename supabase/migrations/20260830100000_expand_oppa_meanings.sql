-- '오빠' 다의어 확장 (2026-08-30 운영자 승인). 데이터만 변경.
-- meanings를 기본 의미 → 파생 의미 순서의 3개 항목으로 교체하고,
-- short_desc를 기본 의미 포함으로 넓히고, origin의 남아있던 주의사항 문구를
-- 실제 어원으로 교체한다(주의사항은 직전 migration에서 usage로 이동됨).

begin;

update public.words set
  short_desc = '여성이 손윗 남성·연인·좋아하는 남자 연예인을 부르는 호칭',
  origin = '''오라버니''의 구어형에서 온 친족 호칭 — 연인, K-POP 팬덤의 애칭으로 의미가 확장됨',
  meanings = '[
    {
      "type": "호칭",
      "definition": "여성이 친오빠나 손윗 남성을 부르는 기본 호칭.",
      "examples": [
        {"kor": "오빠, 밥 먹었어?", "eng": "Oppa, have you eaten?"},
        {"kor": "우리 오빠는 대학생이에요.", "eng": "My older brother is a college student."}
      ]
    },
    {
      "type": "호칭(연인)",
      "definition": "연인 사이에서 여성이 남자친구를 부르는 애칭.",
      "examples": [
        {"kor": "오빠가 데리러 갈게.", "eng": "I''ll come pick you up. (boyfriend speaking)"},
        {"kor": "오빠랑 영화 보러 갈래?", "eng": "Want to go see a movie with me (your oppa)?"}
      ]
    },
    {
      "type": "팬덤",
      "definition": "여성 팬이 좋아하는 남자 연예인을 애정을 담아 부르는 표현.",
      "examples": [
        {"kor": "오빠 최고!", "eng": "Oppa, you''re the best!"},
        {"kor": "오빠 콘서트 직관 가고 싶다.", "eng": "I want to see oppa''s concert in person."}
      ]
    }
  ]'::jsonb
where word = '오빠';

commit;

-- 적용 후 확인:
--   select jsonb_array_length(meanings::jsonb) from public.words where word = '오빠'; → 3