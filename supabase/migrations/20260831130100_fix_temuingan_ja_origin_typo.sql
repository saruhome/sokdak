-- 직전 마이그레이션 적용 중 JA origin_i18n에 오타 혼입("定착" → "定着") — 리포 파일은 정상이었으나
-- MCP 실행 시 입력 오류로 DB에만 잘못 반영됨.
update public.words
set origin_i18n = jsonb_set(
  origin_i18n,
  '{ja}',
  '"「Temu」+「인간(人間)」。誰が最初に作ったかは確認されておらず、2025~26年のSNSの新語まとめや新語辞典サイトを通じて広まった。出典ごとに語釈が分かれる、定着途上の語。"'::jsonb
)
where id = '113';
