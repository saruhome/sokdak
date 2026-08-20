-- Community feed pagination queries order newest posts first and optionally filter by board.
-- These B-tree indexes support both query shapes without adding unused search indexes.
create index if not exists posts_created_at_desc_idx
  on public.posts (created_at desc);

create index if not exists posts_board_created_at_desc_idx
  on public.posts (board, created_at desc);
