-- Enable RLS on ADS table
alter table public.ads enable row level security;

-- Policy: Everyone can view active ads
drop policy if exists "Ads are viewable by everyone" on public.ads;
create policy "Ads are viewable by everyone" 
on public.ads for select using (status = 'active');

-- Policy: Users can create their own ads
drop policy if exists "Users can create ads" on public.ads;
create policy "Users can create ads" 
on public.ads for insert with check (auth.uid() = user_id);

-- Policy: Users can view their own ads (all statuses)
drop policy if exists "Users can view own ads" on public.ads;
create policy "Users can view own ads" 
on public.ads for select using (auth.uid() = user_id);

-- Policy: Users can update their own ads
drop policy if exists "Users can update own ads" on public.ads;
create policy "Users can update own ads" 
on public.ads for update using (auth.uid() = user_id);

-- Policy: Users can delete their own ads
drop policy if exists "Users can delete own ads" on public.ads;
create policy "Users can delete own ads" 
on public.ads for delete using (auth.uid() = user_id);

-- Storage Policies for 'ad-images' bucket (Ensure bucket exists first manually or via script if possible)
-- Note: Creating buckets via SQL is not standard in Supabase, usually done via UI or Storage API. 
-- But we can set policies on storage.objects.

-- Policy: Give public read access to ad-images
drop policy if exists "Public Access Ad Images" on storage.objects;
create policy "Public Access Ad Images"
on storage.objects for select
using ( bucket_id = 'ad-images' );

-- Policy: Allow authenticated users to upload images
drop policy if exists "Authenticated users can upload ad images" on storage.objects;
create policy "Authenticated users can upload ad images"
on storage.objects for insert
with check ( bucket_id = 'ad-images' and auth.role() = 'authenticated' );
