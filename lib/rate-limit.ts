import { headers } from 'next/headers'

/**
 * SPOTTER IP RATE LIMITER
 *
 * Implements in-memory sliding window rate limiting keyed by client IP address.
 * Protects authentication endpoints, database resources, and computationally
 * expensive bcrypt hashing against brute-force and credential stuffing attacks.
 */

export interface RateLimitConfig {
  action: string
  limit: number
  windowMs: number
  errorMessage?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetInSeconds: number
  error?: string
}

interface RateLimitRecord {
  timestamps: number[]
}

// Global store to persist across HMR reloads in development
const globalStore = globalThis as unknown as {
  _spotterRateLimitStore?: Map<string, RateLimitRecord>
}

if (!globalStore._spotterRateLimitStore) {
  globalStore._spotterRateLimitStore = new Map()
}

const rateLimitStore = globalStore._spotterRateLimitStore!

/**
 * Extracts the client IP address from incoming request headers.
 * Resolves standard proxy headers (x-forwarded-for, x-real-ip, cf-connecting-ip).
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers()
    const forwardedFor = headerList.get('x-forwarded-for')
    if (forwardedFor) {
      const firstIp = forwardedFor.split(',')[0].trim()
      if (firstIp) return firstIp
    }
    const realIp = headerList.get('x-real-ip')
    if (realIp) return realIp.trim()

    const cfIp = headerList.get('cf-connecting-ip')
    if (cfIp) return cfIp.trim()
  } catch (err) {
    // headers() might throw if invoked outside of a request context
    console.warn('[RateLimit] Unable to read request headers, falling back to localhost:', err)
  }

  return '127.0.0.1'
}

/**
 * Prunes expired timestamps and entries to prevent memory leaks.
 */
function pruneStore(now: number) {
  if (rateLimitStore.size < 5000) return
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.timestamps.every((ts) => ts < now - 60 * 60 * 1000)) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Enforces in-memory sliding window rate limiting based on client IP.
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const ip = await getClientIp()
  const key = `${config.action}:${ip}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  pruneStore(now)

  let record = rateLimitStore.get(key)
  if (!record) {
    record = { timestamps: [] }
    rateLimitStore.set(key, record)
  }

  // Filter out timestamps outside the current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

  if (record.timestamps.length >= config.limit) {
    const oldest = record.timestamps[0]
    const resetMs = Math.max(0, oldest + config.windowMs - now)
    const resetInSeconds = Math.ceil(resetMs / 1000)

    const defaultMsg =
      resetInSeconds > 60
        ? `Too many attempts from this IP. Please try again in ${Math.ceil(resetInSeconds / 60)} minutes.`
        : `Too many attempts from this IP. Please try again in ${resetInSeconds} seconds.`

    return {
      success: false,
      remaining: 0,
      resetInSeconds,
      error: config.errorMessage || defaultMsg,
    }
  }

  // Record this attempt
  record.timestamps.push(now)
  const remaining = config.limit - record.timestamps.length

  return {
    success: true,
    remaining,
    resetInSeconds: Math.ceil(config.windowMs / 1000),
  }
}

/**
 * Predefined rate limiting configurations for all Spotter forms.
 */
export const RATE_LIMITS = {
  SIGN_UP: {
    action: 'auth:signup',
    limit: 5,
    windowMs: 10 * 60 * 1000, // 5 requests per 10 minutes
    errorMessage: 'Too many account creation attempts. Please wait a few minutes before trying again.',
  },
  SIGN_IN: {
    action: 'auth:signin',
    limit: 5,
    windowMs: 5 * 60 * 1000, // 5 requests per 5 minutes
    errorMessage: 'Too many sign-in attempts from this IP. Please try again in 5 minutes.',
  },
  ACTIVATION_CODE: {
    action: 'auth:activate',
    limit: 5,
    windowMs: 10 * 60 * 1000, // 5 requests per 10 minutes
    errorMessage: 'Too many code attempts from this IP. Please wait a few minutes or ask the front desk.',
  },
  PIN_SETUP: {
    action: 'auth:pin',
    limit: 5,
    windowMs: 5 * 60 * 1000, // 5 requests per 5 minutes
    errorMessage: 'Too many PIN setup attempts from this IP. Please try again in a few minutes.',
  },
  VERIFY_EMAIL: {
    action: 'auth:verify-email',
    limit: 5,
    windowMs: 10 * 60 * 1000, // 5 attempts per 10 minutes
    errorMessage: 'Too many incorrect verification attempts. Please wait a few minutes before trying again.',
  },
  RESEND_VERIFICATION: {
    action: 'auth:resend-verification',
    limit: 3,
    windowMs: 10 * 60 * 1000, // 3 resend requests per 10 minutes
    errorMessage: 'Too many verification code requests. Please wait a few minutes before requesting another code.',
  },
} as const
