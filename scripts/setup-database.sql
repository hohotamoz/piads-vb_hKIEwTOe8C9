-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Linked to auth.users)
-- We ensure that profiles.id MATCHES auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique, -- Pi Username
  pi_uid text unique, -- Link to Pi Network UID
  name text,
  role text default 'user',
  avatar text,
  verified boolean default false,
  preferences jsonb default '{}'::jsonb,
  stats jsonb default '{"piBalance": 0, "totalAds": 0, "totalRatings": 0, "averageRating": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ADS Table
create table if not exists public.ads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price numeric default 0,
  category text,
  region text,
  images text[] default array[]::text[],
  status text default 'active',
  views integer default 0,
  favorites integer default 0,
  is_promoted boolean default false,
  promotion_expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS POLICIES

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.ads enable row level security;

-- PROFILES Policies
-- Public read: Everyone can see profiles (needed for sellers)
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

-- Users can update only their own profile
create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- Insert: Usually handled by Trigger (see below), but if manual insert allowed:
create policy "Users can insert own profile" 
on public.profiles for insert with check (auth.uid() = id);


-- ADS Policies
-- Read: Everyone
create policy "Ads are viewable by everyone" 
on public.ads for select using (true);

-- Insert: Authenticated users can insert ads with their OWN user_id
create policy "Users can create ads" 
on public.ads for insert with check (auth.uid() = user_id);

-- Update: Only owner
create policy "Users can update own ads" 
on public.ads for update using (auth.uid() = user_id);

-- Delete: Only owner
create policy "Users can delete own ads" 
on public.ads for delete using (auth.uid() = user_id);


-- 4. TRIGGER for New User -> Profile
-- Automatically creates a profile row when a new user signs up via Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition (Uncomment if you want auto-creation, 
-- but our API might handle it manually too. Safe to have.)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE POLICIES (Example for 'ad-images')
-- insert into storage.buckets (id, name) values ('ad-images', 'ad-images') on conflict do nothing;
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'ad-images' );
-- create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'ad-images' and auth.role() = 'authenticated' );

-- 5. MESSAGES Table
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid references public.ads(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can view their own messages"
on public.messages for select using (auth.uid() = sender_id OR auth.uid() = receiver_id);

create policy "Users can send messages"
on public.messages for insert with check (auth.uid() = sender_id);

create policy "Users can mark messages as read"
on public.messages for update using (auth.uid() = receiver_id);

-- 6. NOTIFICATIONS Table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
on public.notifications for select using (auth.uid() = user_id);

create policy "System can create notifications"
on public.notifications for insert with check (true);

create policy "Users can mark own notifications as read"
on public.notifications for update using (auth.uid() = user_id);

-- 7. REVIEWS Table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid references public.ads(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 AND rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ad_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone"
on public.reviews for select using (true);

create policy "Authenticated users can create reviews"
on public.reviews for insert with check (auth.uid() = reviewer_id);

-- 8. STORAGE BUCKET for ad images
insert into storage.buckets (id, name, public) 
values ('ad-images', 'ad-images', true) 
on conflict (id) do nothing;

create policy "Public Access to ad images"
on storage.objects for select 
using (bucket_id = 'ad-images');

create policy "Authenticated users can upload ad images"
on storage.objects for insert
with check (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

create policy "Users can update their own ad images"
on storage.objects for update
using (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own ad images"
on storage.objects for delete
using (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
