-- Delete 알잖아 (id 8) — operator decision 2026-08-30. An ordinary colloquial
-- contraction of 너도 알잖아, not a neologism: same class as the previously
-- removed '요즘 뭐 봐?'. Zero real saved_words references at deletion time;
-- FK cascade clears any dependents.
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

delete from public.words where id = '8' and word = '알잖아';
