// Environment variable validation
// Can be imported from server-side code to validate at runtime

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or deployment environment.`
    );
  }
  return value;
}

export function validateEnv() {
  // Public variables (available client-side)
  requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  // Server-only variables
  if (typeof window === "undefined") {
    requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    requireEnv("ANTHROPIC_API_KEY");
    requireEnv("STRIPE_SECRET_KEY");
    requireEnv("STRIPE_WEBHOOK_SECRET");
  }
}

// Export individual validated env getters for type-safe access
export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getAnthropicApiKey(): string {
  return requireEnv("ANTHROPIC_API_KEY");
}
