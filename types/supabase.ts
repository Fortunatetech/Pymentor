/**
 * Supabase Database Types
 * 
 * These types match the schema defined in supabase/schema.sql
 * For comprehensive types, run: npx supabase gen types typescript --local > types/supabase.ts
 */

// ============================================
// Profile Types
// ============================================

export interface Profile {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    skill_level: "beginner" | "intermediate" | "advanced" | null;
    learning_goal: "automation" | "data" | "web" | "general" | null;
    has_completed_onboarding: boolean;
    streak_days: number;
    longest_streak: number;
    last_activity_at: string | null;
    total_xp: number;
    total_lessons_completed: number;
    total_time_spent: number;
    daily_goal_minutes: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// Learning Path Types
// ============================================

export interface LearningPath {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    icon: string | null;
    is_free: boolean;
    order_index: number;
    created_at: string;
}

export interface Module {
    id: string;
    learning_path_id: string;
    title: string;
    description: string | null;
    order_index: number;
    created_at: string;
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    slug: string;
    content: Record<string, unknown> | null;
    xp_reward: number;
    order_index: number;
    lesson_type: "introduction" | "concept" | "practice" | "challenge";
    created_at: string;
}

// ============================================
// User Progress Types
// ============================================

export interface UserLesson {
    id: string;
    user_id: string;
    lesson_id: string;
    status: "not_started" | "in_progress" | "completed";
    score: number | null;
    time_spent: number;
    completed_at: string | null;
    started_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserProgress {
    id: string;
    user_id: string;
    concept: string;
    mastery_level: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// Chat Types
// ============================================

export interface ChatSession {
    id: string;
    user_id: string;
    title: string | null;
    lesson_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
}

// ============================================
// Subscription Types
// ============================================

export interface Subscription {
    id: string;
    user_id: string;
    plan: "free" | "pro_monthly" | "pro_annual" | "lifetime";
    status: "active" | "canceled" | "past_due" | "trialing";
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    updated_at: string;
}

// ============================================
// Challenge Types
// ============================================

export interface DailyChallenge {
    id: string;
    title: string;
    description: string | null;
    difficulty: "easy" | "medium" | "hard";
    starter_code: string | null;
    solution: string | null;
    test_cases: Record<string, unknown> | null;
    xp_reward: number;
    date: string;
    created_at: string;
}

export interface ChallengeAttempt {
    id: string;
    user_id: string;
    challenge_id: string;
    attempt_number: number;
    code: string;
    passed: boolean;
    feedback: string | null;
    created_at: string;
}

export interface UserChallenge {
    id: string;
    user_id: string;
    challenge_id: string;
    status: "not_started" | "in_progress" | "completed";
    attempts: number;
    best_score: number | null;
    completed_at: string | null;
    xp_earned: number;
    created_at: string;
    updated_at: string;
}

// ============================================
// Query Result Types (for Supabase joins)
// ============================================

export interface LearningPathWithModules extends LearningPath {
    modules: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
    lessons: Lesson[];
}

export interface LessonWithProgress extends Lesson {
    user_lessons?: UserLesson[];
}

export interface PathWithProgress extends LearningPath {
    modules: Array<Module & {
        lessons: Array<Lesson & {
            userProgress?: { status: string } | null;
        }>;
    }>;
    progress: number;
    locked: boolean;
}

// ============================================
// Helper type for Supabase query results
// ============================================

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Omit<Profile, "id" | "created_at">> & { id: string };
                Update: Partial<Omit<Profile, "id" | "created_at">>;
            };
            learning_paths: {
                Row: LearningPath;
                Insert: Omit<LearningPath, "id" | "created_at">;
                Update: Partial<Omit<LearningPath, "id" | "created_at">>;
            };
            modules: {
                Row: Module;
                Insert: Omit<Module, "id" | "created_at">;
                Update: Partial<Omit<Module, "id" | "created_at">>;
            };
            lessons: {
                Row: Lesson;
                Insert: Omit<Lesson, "id" | "created_at">;
                Update: Partial<Omit<Lesson, "id" | "created_at">>;
            };
            user_lessons: {
                Row: UserLesson;
                Insert: Omit<UserLesson, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<UserLesson, "id" | "created_at" | "updated_at">>;
            };
            chat_sessions: {
                Row: ChatSession;
                Insert: Omit<ChatSession, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<ChatSession, "id" | "created_at" | "updated_at">>;
            };
            chat_messages: {
                Row: ChatMessage;
                Insert: Omit<ChatMessage, "id" | "created_at">;
                Update: Partial<Omit<ChatMessage, "id" | "created_at">>;
            };
            subscriptions: {
                Row: Subscription;
                Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>;
            };
            daily_challenges: {
                Row: DailyChallenge;
                Insert: Omit<DailyChallenge, "id" | "created_at">;
                Update: Partial<Omit<DailyChallenge, "id" | "created_at">>;
            };
            challenge_attempts: {
                Row: ChallengeAttempt;
                Insert: Omit<ChallengeAttempt, "id" | "created_at">;
                Update: Partial<Omit<ChallengeAttempt, "id" | "created_at">>;
            };
            user_challenges: {
                Row: UserChallenge;
                Insert: Omit<UserChallenge, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<UserChallenge, "id" | "created_at" | "updated_at">>;
            };
        };
    };
};
