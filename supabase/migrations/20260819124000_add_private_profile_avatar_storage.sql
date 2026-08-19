-- Profile photos are personal data. Keep the bucket private and allow each
-- authenticated user to access only the objects stored beneath their own UUID.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile avatars select own" on storage.objects;
drop policy if exists "profile avatars insert own" on storage.objects;
drop policy if exists "profile avatars update own" on storage.objects;
drop policy if exists "profile avatars delete own" on storage.objects;

create policy "profile avatars select own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-avatars'
    and owner = (select auth.uid())
  );

create policy "profile avatars insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-avatars'
    and owner = (select auth.uid())
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "profile avatars update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-avatars'
    and owner = (select auth.uid())
  )
  with check (
    bucket_id = 'profile-avatars'
    and owner = (select auth.uid())
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "profile avatars delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-avatars'
    and owner = (select auth.uid())
  );

commit;
