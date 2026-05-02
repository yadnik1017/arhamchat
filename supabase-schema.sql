-- Run this script in your Supabase SQL Editor to create the required tables

-- 1. Create conversations table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create conversation_participants table
-- This links users to conversations
create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  primary key (conversation_id, user_id)
);

-- 3. Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Realtime on the messages table
-- This is required for new messages to appear in real-time
alter publication supabase_realtime add table public.messages;

-- Optional: Create a trigger to automatically manage updated_at or handle basic RLS
-- But for this assessment, RLS is optional, so we'll leave it wide open (or default).
