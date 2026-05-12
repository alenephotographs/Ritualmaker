-- Storage buckets for user-uploaded or migrated media (optional; product URLs may stay external).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-media',
    'product-media',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  ),
  (
    'archive-media',
    'archive-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']::text[]
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for catalog / gallery assets (uploads still require service role or signed URLs).
create policy "product_media_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-media');

create policy "archive_media_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'archive-media');

-- Writes: service role bypasses RLS. If you later use authenticated uploads, add INSERT policies here.
