-- Public media only; private MEGA/Drive folders never enter Supabase Storage.
insert into storage.buckets (id,name,public,allowed_mime_types)
values ('public-media','public-media',true,array['image/jpeg','image/png','image/webp','video/mp4'])
on conflict (id) do nothing;
-- Uploads are admin managed for now; no INSERT policy for anon/authenticated.
