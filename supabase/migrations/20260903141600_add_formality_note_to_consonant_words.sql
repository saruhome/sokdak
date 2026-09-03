-- consonant 카테고리 초성체(ㄱㄱ/ㅇㅋ/ㅋㅋ/ㅠㅠ/ㄷㄷ/ㅂㅂ/ㅊㅋ) usage에
-- "윗사람·회사 등 격식 있는 자리에서 쓰면 버릇없게 들릴 수 있다" 경고 병기
-- (2026-09-03, 운영자 지시).
--
-- NOTE: applied live via execute_sql before this file was written, so the
-- production version timestamp does not match this filename — see CLAUDE.md
-- provenance convention. Re-running this file is NOT idempotent (it would
-- append the note twice); it is committed for history only.

begin;

update public.words
set usage = usage || ' 윗사람이나 회사 등 격식 있는 자리에서 쓰면 버릇없게 들릴 수 있다.',
    usage_i18n = jsonb_build_object(
      'en', (usage_i18n->>'en') || ' Using it with superiors or in a formal workplace can come across as rude.',
      'ja', (usage_i18n->>'ja') || ' 目上の人や会社など公式な場で使うと失礼に聞こえることがある。',
      'es', (usage_i18n->>'es') || ' Usarlo con superiores o en un entorno laboral formal puede sonar irrespetuoso.',
      'vi', (usage_i18n->>'vi') || ' Dùng với cấp trên hay ở công sở trang trọng có thể nghe thiếu lễ phép.',
      'de', (usage_i18n->>'de') || ' Bei Vorgesetzten oder in einem formellen Arbeitsumfeld kann es respektlos wirken.'
    )
where category = 'consonant';

commit;
