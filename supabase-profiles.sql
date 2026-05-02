-- Run this script in your Supabase SQL Editor to set up user profiles
-- This allows users to see each other to start conversations.

-- 1. Create a public profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  avatar_url text
);

-- 2. Enable Row Level Security (optional but good practice)
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

-- 3. Sync existing users into the profiles table
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- 4. Create a trigger to automatically add new users to the profiles table
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to prevent errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

-- 5. Attach the trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
