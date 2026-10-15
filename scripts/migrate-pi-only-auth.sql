-- Run once in Supabase SQL Editor for an existing PiAds database.
-- Pi Network is the only user-facing identity provider. This only adds the
-- mapping fields needed to link the verified Pi UID to the app's stored profile.
alter table public.profiles add column if not exists pi_uid text;
alter table public.profiles add column if not exists username text;

create unique index if not exists profiles_pi_uid_unique
  on public.profiles (pi_uid)
  where pi_uid is not null;

create unique index if not exists profiles_username_unique
  on public.profiles (username)
  where username is not null;

-- Existing app schema intentionally keeps profiles.id as the Supabase Auth UUID
-- because ads/messages/reviews already reference it. Pi UID is mapped onto it.
