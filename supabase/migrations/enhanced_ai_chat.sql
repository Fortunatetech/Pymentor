-- Enhanced AI Chat System Migration
-- Adds metadata tracking for messages and last_chat_at for returning user detection

-- 1. Add metadata column to chat_messages (stores frustration scores, signals per message)
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Add last_chat_at to profiles (tracks when user last chatted for recap logic)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_chat_at TIMESTAMPTZ;

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
