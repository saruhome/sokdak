-- 랜딩페이지 소셜프루프용 대기자 수 함수.
-- waitlist_subscribers는 SELECT 정책이 의도적으로 없어(이메일 보호) anon이 행을 못 읽는다 —
-- 이 함수는 행이 아니라 개수만 SECURITY DEFINER로 노출한다.
-- 관행 메모: production version 타임스탬프는 MCP 적용 시각이라 파일명과 다를 수 있다.
create or replace function public.waitlist_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer from public.waitlist_subscribers;
$$;

revoke all on function public.waitlist_count() from public;
grant execute on function public.waitlist_count() to anon, authenticated, service_role;
