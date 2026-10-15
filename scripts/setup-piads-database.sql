-- PiAds database setup for a NEW Supabase project.
-- Pi Network is the user-facing login provider. The server uses the Supabase
-- service-role key for trusted writes; never expose that key in browser code.
-- Run this script once in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- Profiles are linked to the internal Supabase Auth user created server-side
-- after Pi verifies the user's identity. Users do not sign in with Supabase.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  username text unique,
  pi_uid text unique,
  name text,
  role text not null default 'user',
  avatar text,
  verified boolean not null default false,
  preferences jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{"piBalance":0,"totalAds":0,"totalRatings":0,"averageRating":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null default 0,
  category text,
  region text,
  images text[] not null default array[]::text[],
  status text not null default 'active' check (status in ('active','pending','expired','sold')),
  views integer not null default 0,
  favorites integer not null default 0,
  is_promoted boolean not null default false,
  promotion_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid references public.ads(id) on delete set null,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_ad_reviewer_unique unique (ad_id, reviewer_id)
);

create index if not exists ads_user_id_idx on public.ads(user_id);
create index if not exists ads_created_at_idx on public.ads(created_at desc);
create index if not exists ads_category_region_idx on public.ads(category, region);
create index if not exists messages_sender_created_idx on public.messages(sender_id, created_at desc);
create index if not exists messages_receiver_created_idx on public.messages(receiver_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists reviews_ad_id_idx on public.reviews(ad_id);

-- Turn on Row Level Security. Public visitors can browse public marketplace
-- content. Writes and private user data must go through trusted server routes
-- that verify the Pi session and use SUPABASE_SERVICE_ROLE_KEY.
alter table public.profiles enable row level security;
alter table public.ads enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "PiAds public profiles read" on public.profiles;
create policy "PiAds public profiles read"
  on public.profiles for select to anon, authenticated using (true);

drop policy if exists "PiAds public ads read" on public.ads;
create policy "PiAds public ads read"
  on public.ads for select to anon, authenticated using (status = 'active' or status = 'sold');

drop policy if exists "PiAds public reviews read" on public.reviews;
create policy "PiAds public reviews read"
  on public.reviews for select to anon, authenticated using (true);

-- Messages and notifications intentionally have no anon/authenticated read
-- policies: private content is accessed through server routes after Pi checks.

-- Create public image bucket. Public can view ad images; uploading/deleting
-- must be done by a trusted server route after verifying the Pi session.
insert into storage.buckets (id, name, public)
values ('ad-images', 'ad-images', true)
on conflict (id) do update set public = true;

drop policy if exists "PiAds public ad image read" on storage.objects;
create policy "PiAds public ad image read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'ad-images');

-- Note: this schema creates tables securely, but client-side create/update/delete
-- operations must use Pi-authenticated server API routes (not direct anon writes).
