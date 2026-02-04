-- Additional SQL functions for PyMentor AI
-- Run this after the main schema.sql

-- Function to increment user XP
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_xp = total_xp + xp_amount,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment lessons completed
CREATE OR REPLACE FUNCTION increment_lessons_completed(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_lessons_completed = total_lessons_completed + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  streak_days INTEGER,
  longest_streak INTEGER,
  total_xp INTEGER,
  lessons_completed BIGINT,
  total_lessons BIGINT,
  concepts_mastered BIGINT,
  time_spent_seconds BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.streak_days,
    p.longest_streak,
    p.total_xp,
    (SELECT COUNT(*) FROM user_lessons ul WHERE ul.user_id = p_user_id AND ul.status = 'completed'),
    (SELECT COUNT(*) FROM lessons),
    (SELECT COUNT(*) FROM user_progress up WHERE up.user_id = p_user_id AND up.mastery_level >= 70),
    COALESCE((SELECT SUM(time_spent) FROM user_lessons ul WHERE ul.user_id = p_user_id), 0)
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and update streak
CREATE OR REPLACE FUNCTION check_daily_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_active DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_active_date, streak_days INTO last_active, current_streak
  FROM profiles WHERE id = p_user_id;
  
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
  
  -- Streak broken, reset to 1
  UPDATE profiles 
  SET streak_days = 1, last_active_date = CURRENT_DATE, updated_at = NOW()
  WHERE id = p_user_id;
  RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert concept mastery with weighted average
CREATE OR REPLACE FUNCTION update_concept_mastery(
  p_user_id UUID,
  p_concept TEXT,
  p_score INTEGER
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_progress (user_id, concept, mastery_level, practice_count, correct_count)
  VALUES (p_user_id, p_concept, p_score, 1, CASE WHEN p_score >= 70 THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, concept) DO UPDATE SET
    mastery_level = ROUND((user_progress.mastery_level * 0.7 + p_score * 0.3)::numeric)::integer,
    practice_count = user_progress.practice_count + 1,
    correct_count = user_progress.correct_count + CASE WHEN p_score >= 70 THEN 1 ELSE 0 END,
    last_practiced = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_lessons_user_id ON user_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lessons_lesson_id ON user_lessons(lesson_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_path_id ON modules(path_id);
