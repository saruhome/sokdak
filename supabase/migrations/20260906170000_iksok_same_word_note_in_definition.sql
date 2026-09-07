-- 익속(283) — '익속마'를 커터칼퇴근(249)과 같은 방식으로 정리 (2026-09-06, 운영자 지시).
--
-- 커터칼퇴근 항목은 형태 변이를 세 군데에 나눠 적는다:
--   (1) aliases에 다른 형태                       → 익속은 이미 aliases={익속마}
--   (2) definition에 "둘은 같은 말 + 어느 쪽이 주로 쓰이나" → 이 마이그레이션이 채우는 부분
--   (3) usage에 "어느 쪽으로 검색해도 항목 하나"   → 익속은 이미 있음
-- (2)만 빠져 있어 채운다. CLAUDE.md 표제어 규칙이 요구하는 세 가지가 이걸로 다 갖춰진다.
--
-- 표제어를 '익속'으로 둔 근거: 확보한 출처 3곳이 모두 '익속'을 표제로 삼고 '익속마'는 곁가지로
-- 언급하며, MBC <언더커버 하이스쿨>(2025)의 화면 자막도 '익속'으로 뜻풀이를 달았다.
-- 커터칼퇴근이 "언론 기사에서는 주로 커터칼퇴근으로 쓴다"고 적은 것과 같은 형식이다.
--
-- production에는 문구를 두 번에 나눠 적용했다(첫 적용이 "같은 말"을 한 문장에 두 번 써서
-- 곧바로 다듬음). 아래는 다듬은 최종 문구 한 번으로 같은 결과를 낸다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

update public.words
   set meanings = jsonb_set(
         jsonb_set(
           meanings, '{0,definition}',
           to_jsonb((meanings->0->>'definition') || ' ''익속''과 ''익속마''는 같은 말이며, 출처와 방송 자막은 주로 ''익속''으로 쓴다.')
         ),
         '{0,definition_i18n}',
         jsonb_build_object(
           'en', (meanings->0->'definition_i18n'->>'en') || ' It is also called 익속마; the two are the same word, and sources and broadcast captions mostly use 익속.',
           'ja', (meanings->0->'definition_i18n'->>'ja') || ' 「익속마」とも呼ばれるが同じ語であり、出典や放送字幕は主に「익속」を使う。',
           'es', (meanings->0->'definition_i18n'->>'es') || ' También se le dice 익속마; son la misma palabra, y las fuentes y los rótulos de televisión usan sobre todo 익속.',
           'vi', (meanings->0->'definition_i18n'->>'vi') || ' Từ này còn được gọi là 익속마; hai dạng là một, và các nguồn cũng như phụ đề truyền hình chủ yếu dùng 익속.',
           'de', (meanings->0->'definition_i18n'->>'de') || ' Es heißt auch 익속마; beides ist dasselbe Wort, und Quellen wie Sendungsuntertitel verwenden überwiegend 익속.'
         )
       )
 where id = '283';

commit;
