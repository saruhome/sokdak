-- 공지 핀: 운영자가 고정한 글 1개를 커뮤니티 탭 최상단(화제의 글 위)에 노출.
-- 관리자 화면은 만들지 않는다 — 운영자는 Supabase Studio(service_role)에서
-- is_pinned를 직접 토글한다 (고객센터 답변과 동일한 운영 관행).
-- 파일명 timestamp와 production version이 다를 수 있음 — repo 관행(MCP 적용 시각이 version).

alter table public.posts add column if not exists is_pinned boolean not null default false;

-- posts는 작성자 본인 UPDATE/INSERT RLS가 열려 있어, 가드 없이는 유저가 자기 글을
-- 셀프 공지로 고정할 수 있다. is_premium 잠금(prevent_client_premium_write)과 동일한
-- 트리거 패턴으로 is_pinned 쓰기를 service_role(운영자)에게만 허용한다.
create or replace function public.prevent_client_pin_write()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_pinned and auth.role() <> 'service_role' then
      raise exception 'is_pinned may only be set by operators';
    end if;
  elsif new.is_pinned is distinct from old.is_pinned and auth.role() <> 'service_role' then
    raise exception 'is_pinned may only be changed by operators';
  end if;
  return new;
end;
$$;

-- REST /rpc 노출 차단 — canonical premium 잠금과 동일 처리
revoke execute on function public.prevent_client_pin_write() from anon, authenticated;

drop trigger if exists posts_prevent_client_pin_write on public.posts;
create trigger posts_prevent_client_pin_write
before insert or update on public.posts
for each row execute function public.prevent_client_pin_write();
