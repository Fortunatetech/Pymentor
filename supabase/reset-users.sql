-- ============================================
-- RESET ALL USER DATA (keeps lesson content intact)
-- Run this in Supabase SQL Editor
-- ============================================
--
-- This script deletes:
--   - All user profiles
--   - All user lesson progress
--   - All user concept mastery
--   - All chat sessions and messages
--   - All subscriptions
--   - All auth.users entries
--
-- This script preserves:
--   - learning_paths
--   - modules
--   - lessons
--   - daily_challenges
--
-- ⚠️  THIS IS IRREVERSIBLE. Make sure you want to do this.
-- ============================================

-- Delete in order to respect foreign key constraints
-- Child tables first, then parent tables

-- 1. Chat messages (depends on chat_sessions)
DELETE FROM public.chat_messages;

-- 2. Chat sessions (depends on profiles)
DELETE FROM public.chat_sessions;

-- 3. User lesson progress (depends on profiles)
DELETE FROM public.user_lessons;

-- 4. User concept mastery (depends on profiles)
DELETE FROM public.user_progress;

-- 5. Subscriptions (depends on profiles)
DELETE FROM public.subscriptions;

-- 6. Profiles (depends on auth.users)
DELETE FROM public.profiles;

-- 7. Auth users (the source of all user data)
-- This requires service_role or superuser privileges
DELETE FROM auth.users;

-- Verify everything is clean
SELECT 'profiles' AS table_name, COUNT(*) AS remaining FROM public.profiles
UNION ALL
SELECT 'user_lessons', COUNT(*) FROM public.user_lessons
UNION ALL
SELECT 'user_progress', COUNT(*) FROM public.user_progress
UNION ALL
SELECT 'chat_sessions', COUNT(*) FROM public.chat_sessions
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM public.chat_messages
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users
UNION ALL
-- Confirm content is untouched
SELECT 'learning_paths (kept)', COUNT(*) FROM public.learning_paths
UNION ALL
SELECT 'modules (kept)', COUNT(*) FROM public.modules
UNION ALL
SELECT 'lessons (kept)', COUNT(*) FROM public.lessons
UNION ALL
SELECT 'daily_challenges (kept)', COUNT(*) FROM public.daily_challenges;
