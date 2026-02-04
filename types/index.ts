export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  skill_level: "beginner" | "intermediate" | "advanced";
  learning_goal: "automation" | "data" | "web" | "general" | null;
  streak_days: number;
  longest_streak: number;
  total_xp: number;
  total_lessons_completed: number;
  total_time_spent: number;
  daily_goal_minutes: number;
  created_at: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  estimated_hours: number | null;
  is_published: boolean;
  is_free: boolean;
  order_index: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  path_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_free: boolean;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  description: string | null;
  content: LessonContent;
  type: "lesson" | "exercise" | "quiz" | "project";
  order_index: number;
  estimated_minutes: number;
  xp_reward: number;
  concepts_taught: string[];
  is_free: boolean;
}

export interface LessonContent {
  sections: ContentSection[];
}

export type ContentSection =
  | { type: "text"; content: string }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; variant: "tip" | "warning" | "info" | "important"; content: string }
  | { type: "exercise"; prompt: string; starter: string; solution: string; hints: string[] };

export interface UserLesson {
  id: string;
  user_id: string;
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  score: number | null;
  attempts: number;
  time_spent: number;
  completed_at: string | null;
}

export interface ChatSession {
  id: string;
  user_id: string;
  lesson_id: string | null;
  title: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "pro_monthly" | "pro_annual" | "lifetime";
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface UserProgress {
  concept: string;
  mastery_level: number;
  practice_count: number;
}

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
