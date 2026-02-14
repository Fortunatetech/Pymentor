import { z } from "zod";

// ============================================
// Chat API Validation
// ============================================

export const chatMessageSchema = z.object({
    message: z
        .string()
        .min(1, "Message is required")
        .max(10000, "Message too long (max 10,000 characters)"),
    session_id: z.string().uuid().optional(),
    lesson_id: z.string().uuid().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ============================================
// Lesson API Validation
// ============================================

export const lessonCompletionSchema = z.object({
    score: z.number().min(0).max(100).optional(),
    time_spent: z.number().min(0).optional(),
    status: z.enum(["not_started", "in_progress", "completed"]).optional(),
});

export type LessonCompletionInput = z.infer<typeof lessonCompletionSchema>;

export const lessonIdSchema = z.object({
    id: z.string().uuid("Invalid lesson ID"),
});

// ============================================
// Challenge API Validation
// ============================================

export const challengeAttemptSchema = z.object({
    challenge_id: z.string().uuid("Invalid challenge ID"),
    code: z.string().min(1, "Code is required").max(50000, "Code too long"),
    attempt_number: z.number().int().min(1).max(10).optional(),
});

export type ChallengeAttemptInput = z.infer<typeof challengeAttemptSchema>;

export const challengeCompleteSchema = z.object({
    challenge_id: z.string().uuid("Invalid challenge ID"),
    attempts: z.number().int().min(1).max(10).default(1),
    time_spent: z.number().min(0).optional(),
});

export type ChallengeCompleteInput = z.infer<typeof challengeCompleteSchema>;

// ============================================
// Project API Validation
// ============================================

export const projectCompleteSchema = z.object({
    project_id: z.string().min(1, "Project ID is required"),
});

export type ProjectCompleteInput = z.infer<typeof projectCompleteSchema>;

// ============================================
// Billing API Validation
// ============================================

export const billingCheckoutSchema = z.object({
    plan: z.enum(["pro_monthly", "pro_annual", "lifetime"], {
        message: "Invalid plan. Choose pro_monthly, pro_annual, or lifetime",
    }),
});

export type BillingCheckoutInput = z.infer<typeof billingCheckoutSchema>;

// ============================================
// User API Validation
// ============================================

export const userProfileUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    skill_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    learning_goal: z.enum(["automation", "data", "web", "general"]).optional(),
    daily_goal_minutes: z.number().int().min(5).max(480).optional(),
});

export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

export const userDeleteConfirmSchema = z.object({
    confirmation: z.literal("DELETE MY ACCOUNT", {
        message: "You must type 'DELETE MY ACCOUNT' to confirm",
    }),
});

// ============================================
// Code Execution Validation
// ============================================

export const codeCheckSchema = z.object({
    code: z.string().min(1, "Code is required").max(50000, "Code too long"),
    lesson_id: z.string().uuid().optional(),
    test_cases: z
        .array(
            z.object({
                input: z.string(),
                expected_output: z.string(),
            })
        )
        .optional(),
});

export type CodeCheckInput = z.infer<typeof codeCheckSchema>;

// ============================================
// Helper: Validate and parse request body
// ============================================

export type ValidationResult<T> =
    | { success: true; data: T; error: null }
    | { success: false; data: null; error: string };

export async function validateRequest<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
    try {
        const body = await request.json();
        const result = schema.safeParse(body);

        if (!result.success) {
            const errorMessages = result.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join(", ");
            return { success: false, data: null, error: errorMessages };
        }

        return { success: true, data: result.data, error: null };
    } catch {
        return { success: false, data: null, error: "Invalid JSON body" };
    }
}


// ============================================
// Helper: Validate query params
// ============================================

export function validateParams<T>(
    params: Record<string, string>,
    schema: z.ZodSchema<T>
): { data: T; error: null } | { data: null; error: string } {
    const result = schema.safeParse(params);

    if (!result.success) {
        const errorMessages = result.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
        return { data: null, error: errorMessages };
    }

    return { data: result.data, error: null };
}
