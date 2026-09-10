-- Tag 야민정음 respellings (댕댕이·커엽다·띵곡) with secondary_category 'yaminjeongeum'
-- (operator decision 2026-09-10). The category itself is added to categories.ts
-- automatically by the morning review once 10+ words carry the tag; until then the
-- app ignores the unknown slug (getCategoryBySlug returns undefined, no badge/filter).
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.
update public.words set secondary_category = 'yaminjeongeum' where id in ('454','459','460') and secondary_category is null;
