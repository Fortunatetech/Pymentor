-- Streak freeze for Pro users
-- Run this in Supabase SQL Editor after schema.sql and functions.sql

-- Add streak freeze column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_freeze_used_at DATE;

-- Updated check_daily_streak function with streak freeze support
CREATE OR REPLACE FUNCTION check_daily_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_active DATE;
  current_streak INTEGER;
  is_pro BOOLEAN;
  freeze_used DATE;
BEGIN
  SELECT last_active_date, streak_days, streak_freeze_used_at
  INTO last_active, current_streak, freeze_used
  FROM profiles WHERE id = p_user_id;

  -- Check if user is Pro
  SELECT EXISTS(
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
    AND plan IN ('pro_monthly', 'pro_annual', 'lifetime')
    AND status IN ('active', 'trialing')
  ) INTO is_pro;

  -- If never active, start streak
  IF last_active IS NULL THEN
    UPDATE profiles
    SET streak_days = 1, last_active_date = CURRENT_DATE, updated_at = NOW()
    WHERE id = p_user_id;
    RETURN 1;
  END IF;

  -- If already active today, return current streak
  IF last_active = CURRENT_DATE THEN
    RETURN current_streak;
  END IF;

  -- If active yesterday, increment streak
  IF last_active = CURRENT_DATE - 1 THEN
    UPDATE profiles
    SET
      streak_days = streak_days + 1,
      longest_streak = GREATEST(longest_streak, streak_days + 1),
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = p_user_id;
    RETURN current_streak + 1;
  END IF;

  -- Missed a day: check if Pro user can use streak freeze
  -- Freeze is available once per week (7 days since last use)
  IF is_pro AND last_active = CURRENT_DATE - 2
    AND (freeze_used IS NULL OR freeze_used < CURRENT_DATE - INTERVAL '7 days') THEN
    -- Use streak freeze: preserve streak, mark freeze as used
    UPDATE profiles
    SET
      last_active_date = CURRENT_DATE,
      streak_freeze_used_at = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = p_user_id;
    RETURN current_streak;
  END IF;

  -- Streak broken, reset to 1
  UPDATE profiles
  SET streak_days = 1, last_active_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = p_user_id;
  RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
