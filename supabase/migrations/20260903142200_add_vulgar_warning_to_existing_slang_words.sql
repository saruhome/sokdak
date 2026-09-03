-- slang 카테고리 전체에 경고 병기 정책 적용 (2026-09-03, 운영자 지시:
-- "속어에 들어가는 모든 단어들은 항상 경고 병기해"). 차별적 비하 표현
-- 3개(김치녀/스시녀/된장녀)는 이미 병기돼 있었고, 나머지 7개(비속어·욕설
-- 계열, 젠더 이슈 없음)에 [비속어·욕설] 경고를 새로 병기한다.
--
-- NOTE: applied live via execute_sql before this file was written — see
-- CLAUDE.md provenance convention. Re-running this file is NOT idempotent
-- (it would append the note twice); committed for history only.

begin;

update public.words
set short_desc = '[비속어·욕설] ' || short_desc,
    short_desc_i18n = jsonb_build_object(
      'en', '[Vulgar/profanity] ' || (short_desc_i18n->>'en'),
      'ja', '[下品な言葉] ' || (short_desc_i18n->>'ja'),
      'es', '[Lenguaje vulgar] ' || (short_desc_i18n->>'es'),
      'vi', '[Ngôn ngữ thô tục] ' || (short_desc_i18n->>'vi'),
      'de', '[Vulgäre Sprache] ' || (short_desc_i18n->>'de')
    )
where category = 'slang'
  and word in ('좆소','존맛탱','존버','두존크','엠창','느금마','니애미');

commit;
