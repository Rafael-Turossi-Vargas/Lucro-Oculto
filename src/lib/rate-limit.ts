/**
 * In-memory rate limiter. Adequate for single-instance deployments.
 * For multi-instance/edge, replace with Upstash Redis.
 */

interface Entry {
  count: number
  reset: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes to avoid memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.reset) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.reset }
  }

  entry.count++
  return { success: true, remaining: limit - entry.count, resetAt: entry.reset }
}
