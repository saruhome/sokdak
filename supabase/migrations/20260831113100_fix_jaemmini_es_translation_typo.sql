-- 직전 마이그레이션 적용 중 ES 번역에 오타 혼입("desp객칭" → "despectivo") — 리포 파일은 정상이었으나
-- MCP 실행 시 입력 오류로 DB에만 잘못 반영됨. 원본 의도값으로 수정.
update public.words
set translations = jsonb_set(
  translations,
  '{4,text}',
  '"Mocoso maleducado (apodo despectivo)"'::jsonb
)
where id = '110';
