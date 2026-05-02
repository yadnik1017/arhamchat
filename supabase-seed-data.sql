-- Seed script to create two test users and a conversation between them
-- Run this in the Supabase SQL Editor

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    conv_id UUID := gen_random_uuid();
BEGIN
    -- 2. Create User 1: alice@example.com / password123
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', user1_id, 'authenticated', 'authenticated', 'alice@example.com', 
        crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
    VALUES (user1_id, user1_id, format('{"sub":"%s","email":"%s"}', user1_id::text, 'alice@example.com')::jsonb, 'email', user1_id::text, now(), now(), now());

    -- 3. Create User 2: bob@example.com / password123
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', user2_id, 'authenticated', 'authenticated', 'bob@example.com', 
        crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at, last_sign_in_at)
    VALUES (user2_id, user2_id, format('{"sub":"%s","email":"%s"}', user2_id::text, 'bob@example.com')::jsonb, 'email', user2_id::text, now(), now(), now());

    -- 4. Create a Conversation between them so you can test it immediately
    INSERT INTO public.conversations (id, created_at) VALUES (conv_id, now());

    -- 5. Add both users to the conversation participants
    INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (conv_id, user1_id);
    INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (conv_id, user2_id);

END $$;
