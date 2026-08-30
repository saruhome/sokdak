-- Word body content was Korean-only (short_desc, usage, origin, and
-- meanings[].definition) — unreadable for the app's actual audience.
-- Structure follows the existing examples convention: per-language keys with
-- en fallback. The i18n columns hold {en, ja, es, vi, de}; Korean stays in the
-- original columns as the source of truth. meanings entries additionally get a
-- definition_i18n object merged in by the companion data migration.
--
-- usage_en/origin_en columns stay (only ㅋㅋ used them) but the app now reads
-- the i18n columns first.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

alter table public.words
  add column if not exists short_desc_i18n jsonb,
  add column if not exists usage_i18n jsonb,
  add column if not exists origin_i18n jsonb;
