-- Weekly content illustration uploads (pregga-admin → uploadWeeklyContentImage)
-- Apply: Supabase Dashboard → SQL → New query → paste → Run
-- Or: supabase db push (from repo with project linked)

insert into storage.buckets (id, name, public, file_size_limit)
values ('weekly-content', 'weekly-content', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

-- Allow signed-in admin (anon key + user JWT) to manage objects in this bucket
drop policy if exists "weekly_content_authenticated_insert" on storage.objects;
drop policy if exists "weekly_content_authenticated_update" on storage.objects;
drop policy if exists "weekly_content_authenticated_delete" on storage.objects;

create policy "weekly_content_authenticated_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'weekly-content');

create policy "weekly_content_authenticated_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'weekly-content');

create policy "weekly_content_authenticated_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'weekly-content');
