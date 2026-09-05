-- 운영자 재지시 (2026-09-05): '-세권' 계열 중 슬세권·편세권·스세권·붕세권 4건만 남기고
-- 나머지 8건(숲/맥/학/몰/병/백/도/수세권)은 보류 — 20260905090100에서 등재한 것을 다시 내린다.
-- 삭제 시점에 saved_words 참조는 0건이었다(사용자 저장 데이터 손실 없음).
-- 다시 올리려면 20260905090100_add_segwon_family.sql의 해당 행을 그대로 insert하면 된다 —
-- 내용은 그 파일에 남아 있으므로 이 삭제는 되돌릴 수 있다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

begin;

delete from public.words
 where id in ('259','262','263','264','265','266','267','268');

do $$
begin
  if (select count(*) from public.words where word like '%세권%') <> 4 then
    raise exception '-세권 표제어가 4건이 아닙니다';
  end if;
end $$;

commit;

-- 적용 후 확인: select count(*) from public.words; → 187
