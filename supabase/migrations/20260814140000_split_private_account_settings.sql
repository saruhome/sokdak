-- Keep public community identity in profiles and isolate account-scoped data behind
-- own-row RLS. Public profile reads must not expose phone, notification settings,
-- premium entitlement, activity streak, or consent timestamps.

begin;

create table if not exists public.account_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  timezone text not null default 'UTC',
  notification_prefs jsonb not null default '{"newSlang": true, "popularSlang": true, "popularPost": true, "like": true, "comment": true}'::jsonb,
  is_premium boolean not null default false,
  streak_count integer not null default 0,
  last_active_date date,
  last_seen_reply_at timestamptz,
  community_guidelines_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.account_settings (
  user_id, phone, timezone, notification_prefs, is_premium, streak_count,
  last_active_date, last_seen_reply_at, community_guidelines_accepted_at
)
select
  id, phone, coalesce(timezone, 'UTC'), notification_prefs, is_premium, streak_count,
  last_active_date, last_seen_reply_at, community_guidelines_accepted_at
from public.profiles
on conflict (user_id) do nothing;

alter table public.account_settings enable row level security;

create policy "users can view their own account settings"
  on public.account_settings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can update their own account settings"
  on public.account_settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.prevent_client_premium_write()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_premium is distinct from old.is_premium and auth.role() <> 'service_role' then
    raise exception 'is_premium may only be changed by the trusted billing service';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_client_premium_write on public.profiles;
drop trigger if exists account_settings_prevent_client_premium_write on public.account_settings;
create trigger account_settings_prevent_client_premium_write
before update on public.account_settings
for each row
execute function public.prevent_client_premium_write();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_emoji', '🐦')
  )
  on conflict (id) do nothing;

  insert into public.account_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

alter table public.profiles
  drop column if exists phone,
  drop column if exists timezone,
  drop column if exists notification_prefs,
  drop column if exists is_premium,
  drop column if exists streak_count,
  drop column if exists last_active_date,
  drop column if exists last_seen_reply_at,
  drop column if exists community_guidelines_accepted_at;

commit;
