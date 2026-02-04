// In-memory sliding window rate limiter
// For production, consider using Redis or Upstash

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  const keys = Array.from(store.keys());
  for (const key of keys) {
    const entry = store.get(key);
    if (!entry) continue;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Maximum number of requests in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterMs?: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  cleanup(config.windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + config.windowMs - now;
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - entry.timestamps.length,
  };
}

// Pre-configured rate limiters for different route types
export const RATE_LIMITS = {
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 req/min
  apiPro: { limit: 1000, windowMs: 60 * 1000 }, // 1000 req/min
  codeRun: { limit: 50, windowMs: 60 * 60 * 1000 }, // 50 req/hr
  codeRunPro: { limit: 500, windowMs: 60 * 60 * 1000 }, // 500 req/hr
} as const;
