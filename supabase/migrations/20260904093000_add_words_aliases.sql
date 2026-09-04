-- words.aliases — 같은 단어의 다른 표기를 검색에만 태우기 위한 컬럼 (2026-09-04).
--
-- 'JMT'와 '제이엠티'·'존맛탱'처럼 한 단어를 알파벳과 한글로 함께 쓰는 경우, 표기마다 표제어를
-- 만들면 같은 단어가 검색 결과에 여러 번 나온다. 표제어는 하나만 두고 나머지 표기는 여기에 넣어
-- 검색에서만 매칭시킨다(src/features/dictionary/model/wordSearch.ts의 'alias' 필드).
-- 화면에는 노출하지 않는다.
--
-- NOT NULL을 걸지 않는 이유: 단어 등록은 draft_payload를 jsonb_populate_record로 words에
-- 그대로 붓는 방식이라, aliases 키가 없는 payload는 NULL이 들어온다. 클라이언트는
-- `row.aliases ?? []`로 받으므로 다른 nullable 컬럼과 똑같이 다루면 된다.

alter table public.words add column if not exists aliases text[] default '{}';

comment on column public.words.aliases is '같은 단어의 다른 표기(JMT/제이엠티/존맛탱). 검색에만 쓰고 화면에는 노출하지 않는다 — 표기별로 표제어를 나누지 않기 위한 것.';
