-- Add expectedOutput to deterministic exercises
-- Run this in Supabase SQL Editor after seed data is loaded
-- This updates exercise sections to include expectedOutput for validation

-- Update "Understanding Errors" lesson - fix the code exercise
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"expectedOutput": "Hello, World!"}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'errors';

-- Update "Variables" lesson - favorite_color exercise (open-ended, add validation type)
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"validation": "open", "requiredPatterns": ["favorite_color", "print"]}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'variables';

-- Update "Numbers and Math" lesson - area calculation
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"expectedOutput": "40"}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'numbers';

-- Update "Strings" lesson - f-string exercise (open-ended)
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"validation": "open", "requiredPatterns": ["first_name", "last_name", "print", "f\""]}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'strings';

-- Update "If Statements" lesson - positive/negative/zero check
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"expectedOutput": "Negative"}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'if-statements';

-- Update "For Loops" lesson - print 1 to 10
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"expectedOutput": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10"}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'for-loops';

-- Update "While Loops" lesson - countdown
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"expectedOutput": "5\n4\n3\n2\n1\nLiftoff!"}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'while-loops';

-- Update "First Code" lesson - print your name (open-ended)
UPDATE public.lessons
SET content = jsonb_set(
  content,
  '{sections}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'type' = 'exercise' THEN elem || '{"validation": "open", "requiredPatterns": ["print"]}'::jsonb
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content->'sections') AS elem
  )
)
WHERE slug = 'first-code';
