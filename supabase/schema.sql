-- PyMentor AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  learning_goal TEXT CHECK (learning_goal IN ('automation', 'data', 'web', 'general')),
  preferred_examples TEXT,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_xp INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  daily_goal_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEARNING PATHS
-- ============================================
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  icon TEXT DEFAULT '🐍',
  estimated_hours INTEGER,
  is_published BOOLEAN DEFAULT false,
  is_free BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODULES (groups of lessons within a path)
-- ============================================
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LESSONS
-- ============================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  type TEXT DEFAULT 'lesson' CHECK (type IN ('lesson', 'exercise', 'quiz', 'project')),
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 10,
  concepts_taught TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER LESSON PROGRESS
-- ============================================
CREATE TABLE public.user_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in seconds
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================
-- USER CONCEPT MASTERY
-- ============================================
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  practice_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, concept)
);

-- ============================================
-- CHAT SESSIONS
-- ============================================
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT,
  context JSONB DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT MESSAGES
-- ============================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_monthly', 'pro_annual', 'lifetime')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY CHALLENGES
-- ============================================
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prompt TEXT NOT NULL,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB DEFAULT '[]',
  hints TEXT[] DEFAULT '{}',
  xp_reward INTEGER DEFAULT 5,
  date DATE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User lessons: users can only access their own progress
CREATE POLICY "Users can manage own lesson progress" ON public.user_lessons
  FOR ALL USING (auth.uid() = user_id);

-- User progress: users can only access their own mastery
CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Chat sessions: users can only access their own chats
CREATE POLICY "Users can manage own chat sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Chat messages: users can access messages in their sessions
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );

-- Subscriptions: users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Public read access for learning content
CREATE POLICY "Anyone can view published paths" ON public.learning_paths
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view modules" ON public.modules
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view daily challenges" ON public.daily_challenges
  FOR SELECT USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update streak on lesson completion
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_active DATE;
  current_streak INTEGER;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT last_active_date, streak_days INTO last_active, current_streak
    FROM public.profiles WHERE id = NEW.user_id;
    
    IF last_active IS NULL OR last_active < CURRENT_DATE - INTERVAL '1 day' THEN
      -- Streak broken or first activity
      UPDATE public.profiles 
      SET streak_days = 1, last_active_date = CURRENT_DATE, updated_at = NOW()
      WHERE id = NEW.user_id;
    ELSIF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Continuing streak
      UPDATE public.profiles 
      SET streak_days = streak_days + 1, 
          longest_streak = GREATEST(longest_streak, streak_days + 1),
          last_active_date = CURRENT_DATE,
          updated_at = NOW()
      WHERE id = NEW.user_id;
    ELSE
      -- Same day, just update last_active
      UPDATE public.profiles 
      SET last_active_date = CURRENT_DATE, updated_at = NOW()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE ON public.user_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ============================================
-- SEED DATA: Python Fundamentals Path
-- ============================================
INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES (
  'Python Fundamentals',
  'fundamentals',
  'Start your Python journey from scratch. Learn variables, data types, control flow, functions, and more.',
  'beginner',
  '🐍',
  20,
  true,
  false,
  1
);

-- Get the path ID for modules
DO $$
DECLARE
  path_id UUID;
  mod1_id UUID;
  mod2_id UUID;
  mod3_id UUID;
BEGIN
  SELECT id INTO path_id FROM public.learning_paths WHERE slug = 'fundamentals';
  
  -- Module 1: Getting Started
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (path_id, 'Getting Started', 'Your first steps with Python', 1, true)
  RETURNING id INTO mod1_id;
  
  -- Module 2: Data Types
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (path_id, 'Working with Data', 'Variables, strings, numbers, and more', 2, false)
  RETURNING id INTO mod2_id;
  
  -- Module 3: Control Flow
  INSERT INTO public.modules (path_id, title, description, order_index, is_free)
  VALUES (path_id, 'Control Flow', 'Making decisions and repeating code', 3, false)
  RETURNING id INTO mod3_id;
  
  -- Lessons for Module 1
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod1_id, 'Welcome to Python', 'welcome', 'Why Python and what you will learn', 
   '{"sections":[{"type":"text","content":"Welcome to PyMentor AI! Python is one of the most popular programming languages in the world. It''s known for being easy to read and write, making it perfect for beginners."},{"type":"text","content":"In this course, you''ll learn Python from scratch. By the end, you''ll be able to write your own programs, automate tasks, and build cool projects!"},{"type":"callout","variant":"tip","content":"Don''t worry if you''ve never coded before. We''ll take it step by step, and Py (your AI tutor) is always here to help!"}]}',
   'lesson', 1, 5, 5, ARRAY['intro'], true),
  
  (mod1_id, 'Your First Python Code', 'first-code', 'Write and run your first program', 
   '{"sections":[{"type":"text","content":"Let''s write your first Python program! The classic first program is called \"Hello, World!\" - it simply displays a message on the screen."},{"type":"code","language":"python","code":"print(\"Hello, World!\")"},{"type":"text","content":"The `print()` function displays text on the screen. The text inside the quotes is called a **string**."},{"type":"exercise","prompt":"Now it''s your turn! Write code to print your name.","starter":"# Print your name below\nprint()","solution":"print(\"Your Name\")","hints":["Put your name inside the quotes","Don''t forget the quotation marks around your name"]}]}',
   'exercise', 2, 10, 10, ARRAY['print', 'strings'], true),
  
  (mod1_id, 'Understanding Errors', 'errors', 'Learning to read and fix errors', 
   '{"sections":[{"type":"text","content":"Everyone makes mistakes when coding - even experts! When Python finds a problem, it shows an error message. Learning to read these messages is a superpower."},{"type":"code","language":"python","code":"print(\"Hello World)  # Missing closing quote - this will cause an error!"},{"type":"text","content":"Python will tell you: `SyntaxError: EOL while scanning string literal`. This means Python reached the End Of Line while still looking for the closing quote."},{"type":"callout","variant":"tip","content":"Error messages are your friends! They tell you exactly what went wrong and where."},{"type":"exercise","prompt":"Fix the code below so it runs without errors:","starter":"print(Hello, World!\")","solution":"print(\"Hello, World!\")","hints":["Check if all quotes are properly paired","The string needs a quote at the beginning too"]}]}',
   'exercise', 3, 10, 10, ARRAY['errors', 'debugging'], true);
  
  -- Lessons for Module 2
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod2_id, 'Variables: Storing Data', 'variables', 'Learn how to store and use data', 
   '{"sections":[{"type":"text","content":"Variables are like labeled boxes that store data. You can put something in, take it out, or change what''s inside."},{"type":"code","language":"python","code":"name = \"Carlos\"\nage = 25\nprint(name)\nprint(age)"},{"type":"text","content":"Here, `name` stores the text \"Carlos\" and `age` stores the number 25. Notice: no quotes around numbers!"},{"type":"callout","variant":"info","content":"Variable names should be descriptive. `name` is better than `n`, and `user_age` is better than `x`."},{"type":"exercise","prompt":"Create a variable called `favorite_color` and set it to your favorite color, then print it.","starter":"# Create your variable here\n\n# Print it here\n","solution":"favorite_color = \"blue\"\nprint(favorite_color)","hints":["Use the = sign to assign a value","Colors are text, so use quotes"]}]}',
   'exercise', 1, 15, 15, ARRAY['variables', 'assignment'], false),
  
  (mod2_id, 'Numbers and Math', 'numbers', 'Working with numbers in Python', 
   '{"sections":[{"type":"text","content":"Python can do math! You can use it like a super-powered calculator."},{"type":"code","language":"python","code":"# Basic math\nprint(5 + 3)   # Addition: 8\nprint(10 - 4)  # Subtraction: 6\nprint(3 * 4)   # Multiplication: 12\nprint(15 / 3)  # Division: 5.0"},{"type":"text","content":"You can also store results in variables:"},{"type":"code","language":"python","code":"price = 19.99\nquantity = 3\ntotal = price * quantity\nprint(total)  # 59.97"},{"type":"exercise","prompt":"Calculate the area of a rectangle with width 8 and height 5. Store it in a variable called `area` and print it.","starter":"width = 8\nheight = 5\n# Calculate area and print it\n","solution":"width = 8\nheight = 5\narea = width * height\nprint(area)","hints":["Area of a rectangle = width × height","Use * for multiplication"]}]}',
   'exercise', 2, 15, 15, ARRAY['numbers', 'math', 'operators'], false),
  
  (mod2_id, 'Strings: Working with Text', 'strings', 'Manipulating text in Python', 
   '{"sections":[{"type":"text","content":"Strings are sequences of characters (text). You can do lots of cool things with them!"},{"type":"code","language":"python","code":"greeting = \"Hello\"\nname = \"World\"\n\n# Concatenation (joining strings)\nmessage = greeting + \", \" + name + \"!\"\nprint(message)  # Hello, World!"},{"type":"text","content":"You can also use f-strings for easier formatting:"},{"type":"code","language":"python","code":"name = \"Carlos\"\nage = 25\nprint(f\"My name is {name} and I am {age} years old.\")"},{"type":"exercise","prompt":"Create variables for your first_name and last_name, then print your full name using an f-string.","starter":"first_name = \"\"\nlast_name = \"\"\n# Print full name with f-string\n","solution":"first_name = \"John\"\nlast_name = \"Doe\"\nprint(f\"{first_name} {last_name}\")","hints":["f-strings start with f before the quotes","Use {variable_name} to insert variables"]}]}',
   'exercise', 3, 15, 15, ARRAY['strings', 'concatenation', 'f-strings'], false);
  
  -- Lessons for Module 3
  INSERT INTO public.lessons (module_id, title, slug, description, content, type, order_index, estimated_minutes, xp_reward, concepts_taught, is_free)
  VALUES
  (mod3_id, 'If Statements: Making Decisions', 'if-statements', 'Teaching your code to make choices', 
   '{"sections":[{"type":"text","content":"Programs need to make decisions. If statements let your code choose different paths based on conditions."},{"type":"code","language":"python","code":"age = 18\n\nif age >= 18:\n    print(\"You can vote!\")\nelse:\n    print(\"You''re not old enough to vote yet.\")"},{"type":"callout","variant":"important","content":"Notice the colon (:) after the condition and the indentation (4 spaces) for the code inside. Python uses indentation to know what code belongs together!"},{"type":"exercise","prompt":"Write code that checks if a number is positive, negative, or zero.","starter":"number = -5\n\n# Check if positive, negative, or zero\n","solution":"number = -5\n\nif number > 0:\n    print(\"Positive\")\nelif number < 0:\n    print(\"Negative\")\nelse:\n    print(\"Zero\")","hints":["Use if, elif (else if), and else","Check > 0 for positive, < 0 for negative"]}]}',
   'exercise', 1, 15, 15, ARRAY['if', 'else', 'elif', 'conditions'], false),
  
  (mod3_id, 'For Loops: Repeating Code', 'for-loops', 'Learn to iterate over sequences', 
   '{"sections":[{"type":"text","content":"Loops let you repeat code without writing it multiple times. For loops are great for going through a list of items."},{"type":"code","language":"python","code":"fruits = [\"apple\", \"banana\", \"cherry\"]\n\nfor fruit in fruits:\n    print(fruit)"},{"type":"text","content":"You can also use `range()` to repeat something a specific number of times:"},{"type":"code","language":"python","code":"for i in range(5):\n    print(f\"Count: {i}\")  # Prints 0, 1, 2, 3, 4"},{"type":"exercise","prompt":"Write a for loop that prints numbers 1 through 10.","starter":"# Print numbers 1 to 10\n","solution":"for i in range(1, 11):\n    print(i)","hints":["range(1, 11) gives you 1 through 10","The second number in range is exclusive (not included)"]}]}',
   'exercise', 2, 15, 15, ARRAY['for-loop', 'range', 'iteration'], false),
  
  (mod3_id, 'While Loops: Conditional Repetition', 'while-loops', 'Repeat while a condition is true', 
   '{"sections":[{"type":"text","content":"While loops keep running as long as a condition is true. They''re great when you don''t know how many times you need to repeat."},{"type":"code","language":"python","code":"count = 0\n\nwhile count < 5:\n    print(count)\n    count = count + 1  # Don''t forget this or it runs forever!"},{"type":"callout","variant":"warning","content":"Always make sure your while loop can eventually stop! If the condition never becomes False, you get an infinite loop."},{"type":"exercise","prompt":"Write a while loop that counts down from 5 to 1, then prints ''Liftoff!''","starter":"countdown = 5\n\n# Write your while loop here\n","solution":"countdown = 5\n\nwhile countdown > 0:\n    print(countdown)\n    countdown = countdown - 1\n\nprint(\"Liftoff!\")","hints":["Start at 5 and go down while countdown > 0","Subtract 1 each time","Print Liftoff after the loop ends"]}]}',
   'exercise', 3, 15, 15, ARRAY['while-loop', 'conditions'], false);
  
END $$;

-- Add more paths (locked for now)
INSERT INTO public.learning_paths (title, slug, description, difficulty, icon, estimated_hours, is_published, is_free, order_index)
VALUES 
('Python for Automation', 'automation', 'Automate boring tasks with Python. Learn file handling, web scraping, and more.', 'intermediate', '🤖', 25, true, false, 2),
('Python for Data Analysis', 'data-analysis', 'Analyze data with pandas, create visualizations, and gain insights.', 'intermediate', '📊', 30, true, false, 3);
