-- ============================================
-- USER CHALLENGES TABLE & MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- Create user_challenges table for tracking challenge attempts
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
  attempts_used INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own challenge records
CREATE POLICY "Users can manage own challenge records" ON public.user_challenges
  FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON public.user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_created_at ON public.user_challenges(created_at DESC);

-- ============================================
-- OPTIONAL: If table already exists, add missing columns
-- ============================================
-- Run these only if you already have a user_challenges table without these columns:

-- ALTER TABLE public.user_challenges ADD COLUMN IF NOT EXISTS attempts_used INTEGER DEFAULT 0;
-- ALTER TABLE public.user_challenges ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
-- ALTER TABLE public.user_challenges ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_challenges TO authenticated;
GRANT SELECT ON public.user_challenges TO anon;
