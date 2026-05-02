-- Run this script in your Supabase SQL Editor to fix RLS issues

-- Disable RLS on the main tables so the app can read/write freely
-- (since RLS is optional for this assessment)
alter table public.conversations disable row level security;
alter table public.conversation_participants disable row level security;
alter table public.messages disable row level security;

-- If you prefer keeping RLS enabled, you can run these instead:
-- alter table public.conversations enable row level security;
-- create policy "Allow all authenticated users" on public.conversations for all to authenticated using (true);
-- alter table public.conversation_participants enable row level security;
-- create policy "Allow all authenticated users" on public.conversation_participants for all to authenticated using (true);
-- alter table public.messages enable row level security;
-- create policy "Allow all authenticated users" on public.messages for all to authenticated using (true);
