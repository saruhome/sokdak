-- Daily slang-scout pipeline (operator plan 2026-08-30: AI가 매일 수집·초안 작성,
-- 사람은 아침 검수·승인만, 승인 시 Claude Code가 words로 승격).
-- 후보가 검수 시점에 상세페이지 전체를 보여줄 수 있도록 words 형태의 완성 초안을
-- draft_payload에 담는다 — 승격은 이 JSON의 기계적 insert가 된다.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

alter table public.slang_candidates
  add column if not exists draft_payload jsonb;

comment on column public.slang_candidates.draft_payload is
  'words 테이블 형태의 완성 초안(6개 언어 본문·예문 포함). 승격 시 이 JSON을 그대로 insert.';
