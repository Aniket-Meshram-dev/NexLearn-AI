import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Check if Upstash credentials exist
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis: Redis | null = null;
if (isUpstashConfigured) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    console.warn('[RateLimit] Upstash Redis initialization failed. Using in-memory fallback.', err);
    redis = null;
  }
}

// In-Memory sliding window fallback store
interface MemoryRecord {
  count: number;
  resetAt: number;
}
const memoryStore = new Map<string, MemoryRecord>();

// Cleanup stale memory records periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export type LimiterType = 'courseGen' | 'aiChat' | 'otp' | 'auth';

interface LimiterConfig {
  max: number;
  windowMs: number;
  windowStr: `${number} s` | `${number} m` | `${number} h` | `${number} d`;
}

const LIMITER_CONFIGS: Record<LimiterType, LimiterConfig> = {
  courseGen: { max: 5, windowMs: 10 * 60 * 1000, windowStr: '10 m' },
  aiChat: { max: 30, windowMs: 60 * 1000, windowStr: '1 m' },
  otp: { max: 5, windowMs: 10 * 60 * 1000, windowStr: '10 m' },
  auth: { max: 10, windowMs: 15 * 60 * 1000, windowStr: '15 m' },
};

// Upstash limiters cache
const upstashLimiters = new Map<LimiterType, Ratelimit>();
if (redis) {
  for (const [type, config] of Object.entries(LIMITER_CONFIGS)) {
    upstashLimiters.set(
      type as LimiterType,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.max, config.windowStr),
        prefix: 'nexlearn:rl:',
        analytics: true,
      })
    );
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp in ms
  retryAfter: number; // seconds
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Applies rate limiting to a given identifier using Upstash Redis or In-Memory fallback
 */
export async function applyRateLimit(
  type: LimiterType,
  identifier: string
): Promise<RateLimitResult> {
  const config = LIMITER_CONFIGS[type];
  const now = Date.now();
  const fullKey = `${type}:${identifier}`;

  // 1. Try Upstash Redis if available
  const upstashLimiter = upstashLimiters.get(type);
  if (upstashLimiter) {
    try {
      const res = await upstashLimiter.limit(identifier);
      const retryAfter = Math.max(1, Math.ceil((res.reset - now) / 1000));
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        reset: res.reset,
        retryAfter: res.success ? 0 : retryAfter,
      };
    } catch (err) {
      console.warn(`[RateLimit] Upstash call failed for ${type}:${identifier}, falling back to memory:`, err);
    }
  }

  // 2. Fallback: In-Memory Sliding Window
  let record = memoryStore.get(fullKey);

  if (!record || now > record.resetAt) {
    record = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    memoryStore.set(fullKey, record);
    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: record.resetAt,
      retryAfter: 0,
    };
  }

  if (record.count >= config.max) {
    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      reset: record.resetAt,
      retryAfter,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: config.max,
    remaining: config.max - record.count,
    reset: record.resetAt,
    retryAfter: 0,
  };
}

/**
 * Generates standard 429 Too Many Requests response
 */
export function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: `Too many requests. Please slow down and try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
      },
    }
  );
}
