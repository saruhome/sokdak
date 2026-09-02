-- 문의 사진 첨부: 비공개 버킷(본인 폴더만 읽기/쓰기) + support_tickets.image_path.
-- 운영진은 Studio(service_role)로 RLS 우회 열람. profile-avatars와 동일한 signed URL 패턴.
-- 참고: 파일명 timestamp와 production version이 다를 수 있음 — MCP 적용 시각이 version이 되는 repo 관행.
insert into storage.buckets (id, name, public)
values ('support-attachments', 'support-attachments', false)
on conflict (id) do nothing;

create policy "support attachments insert own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "support attachments read own folder"
on storage.objects for select to authenticated
using (bucket_id = 'support-attachments' and (storage.foldername(name))[1] = auth.uid()::text);

alter table public.support_tickets add column if not exists image_path text;
