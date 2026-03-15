/**
 * Rate limiter com suporte a Redis (Upstash) para deployments multi-instância.
 *
 * Se UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN estiverem definidos,
 * usa Redis (adequado para Vercel serverless com múltiplas instâncias).
 * Caso contrário, cai silenciosamente para o rate limiter em memória (dev / single-instance).
 *
 * Configurar Upstash: https://console.upstash.com → criar Redis DB → copiar env vars
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ── Redis client (inicializado apenas se env vars presentes) ──────────────────
const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

let redisClient: Redis | null = null
if (hasRedis) {
  try {
    redisClient = Redis.fromEnv()
  } catch {
    // Falha silenciosa — usa fallback in-memory
    redisClient = null
  }
}

// Cache de instâncias Ratelimit por configuração (evita recriar a cada request)
const rlCache = new Map<string, Ratelimit>()

function msToUpstashDuration(ms: number): `${number} ${"ms" | "s" | "m" | "h" | "d"}` {
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${Math.round(ms / 1000)} s`
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} m`
  return `${Math.round(ms / 3_600_000)} h`
}

function getRedisLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  if (!rlCache.has(cacheKey)) {
    rlCache.set(
      cacheKey,
      new Ratelimit({
        redis: redisClient!,
        limiter: Ratelimit.slidingWindow(limit, msToUpstashDuration(windowMs)),
        prefix: "rl",
      })
    )
  }
  return rlCache.get(cacheKey)!
}

// ── In-memory fallback ────────────────────────────────────────────────────────
interface Entry {
  count: number
  reset: number
}

const store = new Map<string, Entry>()

// Limpa entradas expiradas a cada 5 minutos para evitar memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.reset) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

function inMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
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

// ── IP helper ─────────────────────────────────────────────────────────────────

/** IPv4 (ex: 192.168.1.1) ou IPv6 compacto (ex: ::1 ou 2001:db8::1) */
const IP_REGEX = /^((\d{1,3}\.){3}\d{1,3}|([\da-f]{0,4}:){2,7}[\da-f]{0,4})$/i

/**
 * Extrai e valida o IP do cliente a partir do request.
 * Usa apenas o primeiro IP do header x-forwarded-for para evitar spoofing
 * via IPs extras injetados pelo atacante no final da cadeia.
 */
export function getClientIp(request: Request | { headers: { get(name: string): string | null } }): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim() ?? ""
    if (ip && IP_REGEX.test(ip)) return ip
  }
  return "unknown"
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (redisClient) {
    try {
      const limiter = getRedisLimiter(limit, windowMs)
      const result = await limiter.limit(key)
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      }
    } catch {
      // Redis indisponível — fallback gracioso para in-memory
      console.warn("[rate-limit] Redis unavailable, falling back to in-memory")
    }
  }

  return inMemoryRateLimit(key, limit, windowMs)
}
