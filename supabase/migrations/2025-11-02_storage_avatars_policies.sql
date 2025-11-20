-- Create bucket with required "name" column populated
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Clean-slate the policies so re-runs don't choke
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "User can upload own avatar" on storage.objects;
drop policy if exists "User can update own avatar" on storage.objects;
drop policy if exists "User can delete own avatar" on storage.objects;

-- Public read
create policy "Public read avatars"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'avatars');

-- User can upload own avatar
create policy "User can upload own avatar"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' and auth.uid() = owner);

-- User can update own avatar
create policy "User can update own avatar"
on storage.objects for update
to authenticated
using (bucket_id = 'avatars' and auth.uid() = owner);

-- User can delete own avatar
create policy "User can delete own avatar"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' and auth.uid() = owner);
