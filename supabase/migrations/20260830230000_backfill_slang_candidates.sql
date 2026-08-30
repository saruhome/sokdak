-- Backfill slang_candidates from the live words table (operator request
-- 2026-08-30). The candidates pipeline table was empty; every published
-- dictionary word now has a candidate row in status 'published' so the
-- pipeline's history starts from reality. One shared run_id marks this
-- backfill batch; sources records the origin word id and category.
--
-- Idempotent: normalized_term is unique — on conflict do nothing.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

with backfill_run as (select gen_random_uuid() as run_id)
insert into public.slang_candidates
  (run_id, term, normalized_term, meaning_ko, meaning_en_draft, example, sources, status)
select
  backfill_run.run_id,
  w.word,
  lower(trim(w.word)),
  coalesce(w.meanings->0->>'definition', w.short_desc, ''),
  coalesce(w.meanings->0->'definition_i18n'->>'en', w.short_desc_i18n->>'en', ''),
  coalesce(w.meanings->0->'examples'->0->>'kor', ''),
  jsonb_build_array(jsonb_build_object(
    'type', 'sokdak_words_backfill',
    'word_id', w.id,
    'category', w.category,
    'backfilled_at', now()
  )),
  'published'
from public.words w
cross join backfill_run
on conflict (normalized_term) do nothing;
