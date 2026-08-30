-- Community board restructure (operator-approved UX decision 2026-08-30):
-- 궁금해요 / Q&A / 질문하기 were three names for the same thing — every real
-- post landed in 궁금해요 and users could not tell them apart. Merge all three
-- into 질문 and add 자유 (zero-pressure free-talk board, the natural entry
-- point for beginners — pairs with the write screen's language nudge).
--
-- NOTE: filename timestamp differs from the production migration version
-- (MCP apply time becomes the version) — repo-wide convention, see CLAUDE.md.

alter table public.posts drop constraint posts_board_check;

update public.posts
  set board = '질문'
  where board in ('궁금해요', 'Q&A', '질문하기');

alter table public.posts
  add constraint posts_board_check check (board in ('질문', '자유'));
