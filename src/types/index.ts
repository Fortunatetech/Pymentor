// Database types for Supabase
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  learning_goal: 'general' | 'automation' | 'data' | 'web' | 'ai' | null;
  preferred_examples: string;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
  total_xp: number;
  total_lessons_completed: number;
  total_time_spent: number;
  daily_goal_minutes: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  estimated_hours: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  path_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_free: boolean;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: LessonContent;
  lesson_type: 'lesson' | 'exercise' | 'quiz' | 'project';
  order_index: number;
  estimated_minutes: number;
  xp_reward: number;
  concepts_taught: string[];
  prerequisites: string[];
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonContent {
  sections: ContentSection[];
}

export interface ContentSection {
  type: 'text' | 'code' | 'exercise' | 'quiz';
  content?: string;
  language?: string;
  code?: string;
  prompt?: string;
  starter_code?: string;
  solution?: string;
  hints?: string[];
}

export interface UserLesson {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  attempts: number;
  time_spent_seconds: number;
  completed_at: string | null;
  last_accessed_at: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  concept: string;
  mastery_level: number;
  practice_count: number;
  correct_count: number;
  last_practiced: string | null;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: 'completed_topics' | 'struggled_topics' | 'session_summary' | 'preferences';
  content: Record<string, unknown>;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  lesson_id: string | null;
  title: string | null;
  context: Record<string, unknown>;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  starter_code: string | null;
  solution_code: string | null;
  test_cases: TestCase[];
  hints: string[];
  xp_reward: number;
  active_date: string | null;
  created_at: string;
}

export interface TestCase {
  input: unknown;
  expected: unknown;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_freeze_available: boolean;
  streak_freeze_used_at: string | null;
  created_at: string;
}

// AI Context types
export interface AIContext {
  user: {
    name: string;
    skill_level: string;
    learning_goal: string | null;
    streak_count: number;
  };
  current_lesson?: {
    title: string;
    concepts: string[];
  };
  mastered_concepts: string[];
  struggling_concepts: string[];
  recent_session_summary?: string;
}
