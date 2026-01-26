-- 1. Create MESSAGES Table if not exists
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid not null, -- Can reference ads(id) or be loose if ad deleted
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create REVIEWS Table if not exists
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  ad_id uuid references public.ads(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- 4. MESSAGES Policies

-- Users can see messages where they are sender or receiver (ID match or Email match for legacy support)
drop policy if exists "Users can see their own messages" on public.messages;
create policy "Users can see their own messages" 
on public.messages for select 
using (
  auth.uid() = sender_id 
  OR auth.uid() = receiver_id
  OR auth.email() in (select email from public.profiles where id = sender_id or id = receiver_id)
);

-- Users can insert messages if they are the sender (ID or Email match)
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages" 
on public.messages for insert 
with check (
  auth.uid() = sender_id
  OR auth.email() in (select email from public.profiles where id = sender_id)
);

-- Users can update (mark as read) messages if they are receiver
drop policy if exists "Users can update received messages" on public.messages;
create policy "Users can update received messages" 
on public.messages for update 
using (
  auth.uid() = receiver_id
  OR auth.email() in (select email from public.profiles where id = receiver_id)
);


-- 5. REVIEWS Policies

-- Reviews are public read
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" 
on public.reviews for select 
using (true);

-- Authenticated users can create reviews
drop policy if exists "Users can create reviews" on public.reviews;
create policy "Users can create reviews" 
on public.reviews for insert 
with check (auth.uid() = reviewer_id);

-- Reviewers can delete their own reviews
drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews" 
on public.reviews for delete 
using (auth.uid() = reviewer_id);
