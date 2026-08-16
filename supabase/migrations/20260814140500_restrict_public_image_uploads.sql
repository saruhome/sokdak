-- Community images are intentionally public for post rendering, but uploads must
-- be constrained at the Storage layer as well as in the client.

begin;

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'post-images';

update storage.buckets
set
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'word-thumbnails';

commit;
