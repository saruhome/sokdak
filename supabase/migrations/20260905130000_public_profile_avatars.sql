-- Profile photos now show on community posts/comments (operator request), which makes them
-- public-facing content: switch the profile-avatars bucket to public read so the client can
-- render plain public URLs everywhere. Upload/update/delete stay owner-only; the existing
-- signed-URL path in the app keeps working unchanged.
-- (File timestamp differs from the production version applied via MCP — existing repo convention.)

update storage.buckets set public = true where id = 'profile-avatars';
