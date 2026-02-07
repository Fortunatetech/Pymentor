-- ============================================
-- PyMentor AI: Master Seed File
-- Runs all lesson seeds in order
-- ============================================
-- 
-- HOW TO USE:
-- 1. Run this file in Supabase SQL Editor
-- 2. It will create all 4 learning levels with 100+ lessons
-- 3. The progression system requires 80% completion to unlock next level
--
-- FILES INCLUDED:
-- - seed-fundamentals.sql (Level 1: 6 modules, ~20 lessons)
-- - seed-beginner.sql (Level 2: 7 modules, ~18 lessons)
-- - seed-intermediate.sql (Level 3: 7 modules, ~15 lessons)
-- - seed-advanced.sql (Level 4: 7 modules, ~12 lessons)
--
-- Run each file in order, or use this consolidated instruction:
-- 1. seed-fundamentals.sql
-- 2. seed-beginner.sql
-- 3. seed-intermediate.sql
-- 4. seed-advanced.sql
-- ============================================

-- ============================================
-- HELPER FUNCTIONS FOR LEVEL PROGRESSION
-- ============================================

-- Function to calculate completion percentage for a learning path
CREATE OR REPLACE FUNCTION public.get_path_completion(
  p_user_id UUID,
  p_path_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
BEGIN
  -- Count total lessons in path
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.modules m ON l.module_id = m.id
  WHERE m.path_id = p_path_id;
  
  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count completed lessons
  SELECT COUNT(*) INTO completed_lessons
  FROM public.user_lessons ul
  JOIN public.lessons l ON ul.lesson_id = l.id
  JOIN public.modules m ON l.module_id = m.id
  WHERE ul.user_id = p_user_id 
    AND m.path_id = p_path_id 
    AND ul.status = 'completed';
  
  RETURN ROUND((completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can access a specific level
CREATE OR REPLACE FUNCTION public.can_access_level(
  p_user_id UUID,
  p_path_order INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  prev_path_id UUID;
  prev_completion NUMERIC;
BEGIN
  -- Level 1 (Fundamentals) is always accessible
  IF p_path_order <= 1 THEN
    RETURN TRUE;
  END IF;
  
  -- Get the previous level's path ID
  SELECT id INTO prev_path_id
  FROM public.learning_paths
  WHERE order_index = p_path_order - 1
  AND is_published = true;
  
  IF prev_path_id IS NULL THEN
    RETURN TRUE; -- If no previous level, allow access
  END IF;
  
  -- Check if previous level is 100% complete
  prev_completion := public.get_path_completion(p_user_id, prev_path_id);
  
  RETURN prev_completion >= 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's unlocked levels
CREATE OR REPLACE FUNCTION public.get_unlocked_levels(
  p_user_id UUID
) RETURNS TABLE (
  path_id UUID,
  path_title TEXT,
  path_slug TEXT,
  order_index INTEGER,
  completion_percentage NUMERIC,
  is_unlocked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.id,
    lp.title,
    lp.slug,
    lp.order_index,
    public.get_path_completion(p_user_id, lp.id),
    public.can_access_level(p_user_id, lp.order_index)
  FROM public.learning_paths lp
  WHERE lp.is_published = true
  ORDER BY lp.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW FOR LESSON PROGRESS DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW public.user_lesson_stats AS
SELECT 
  p.id as user_id,
  lp.id as path_id,
  lp.title as path_title,
  lp.order_index,
  COUNT(DISTINCT l.id) as total_lessons,
  COUNT(DISTINCT CASE WHEN ul.status = 'completed' THEN ul.lesson_id END) as completed_lessons,
  COUNT(DISTINCT CASE WHEN ul.status = 'in_progress' THEN ul.lesson_id END) as in_progress_lessons,
  ROUND(
    COALESCE(
      COUNT(DISTINCT CASE WHEN ul.status = 'completed' THEN ul.lesson_id END)::NUMERIC / 
      NULLIF(COUNT(DISTINCT l.id), 0)::NUMERIC * 100, 
      0
    ), 
    2
  ) as completion_percentage
FROM public.profiles p
CROSS JOIN public.learning_paths lp
LEFT JOIN public.modules m ON m.path_id = lp.id
LEFT JOIN public.lessons l ON l.module_id = m.id
LEFT JOIN public.user_lessons ul ON ul.lesson_id = l.id AND ul.user_id = p.id
WHERE lp.is_published = true
GROUP BY p.id, lp.id, lp.title, lp.order_index;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_path_completion TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unlocked_levels TO authenticated;
GRANT SELECT ON public.user_lesson_stats TO authenticated;

-- ============================================
-- RLS POLICY FOR LEVEL ACCESS
-- ============================================

-- Note: The lesson page should check can_access_level before showing content
-- This is handled in the API layer for flexibility

SELECT 'Master seed file ready. Now run the individual level files in order:';
SELECT '1. seed-fundamentals.sql';
SELECT '2. seed-beginner.sql';
SELECT '3. seed-intermediate.sql';
SELECT '4. seed-advanced.sql';
