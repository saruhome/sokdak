-- 카테고리 즐겨찾기(authStore._likedCategorySlugs)가 지금까지 세션 메모리에만 있어
-- 로그아웃·재설치하면 사라지는데도, 마이페이지 "저장한 단어" 화면에는 영구 저장된
-- 즐겨찾기처럼 표시되고 있었다. saved_posts와 동일한 컨벤션으로 실제 테이블을 만든다.
-- 카테고리 자체는 Supabase 테이블이 아니라 constants/categories.ts의 고정 배열이라
-- category_slug는 외래키 없이 텍스트로만 저장한다.
--
-- NOT applied to production by this session — review and run via Supabase SQL Editor
-- or `apply_migration` as a separate, explicit operator step.

begin;

create table if not exists public.liked_categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  category_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, category_slug)
);

alter table public.liked_categories enable row level security;

create policy "users manage their own liked categories"
on public.liked_categories for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

commit;
