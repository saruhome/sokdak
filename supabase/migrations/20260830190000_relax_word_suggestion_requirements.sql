-- Word suggestions: category and definition become optional (operator decision
-- 2026-08-30) — a user may know a new word without knowing its meaning or
-- where it fits; the word itself is the valuable signal. Only `word` stays
-- required.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

alter table public.word_suggestions
  alter column category_slug drop not null,
  alter column definition drop not null;
