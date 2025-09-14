interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const entry = this.limits.get(identifier)

    if (!entry || now > entry.resetTime) {
      // First request or window has expired
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      })
      return true
    }

    if (entry.count >= this.maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxRequests
    }
    return Math.max(0, this.maxRequests - entry.count)
  }

  getResetTime(identifier: string): number {
    const entry = this.limits.get(identifier)
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.windowMs
    }
    return entry.resetTime
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }
}

// Global rate limiters for different operations
export const generalRateLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requests per 15 minutes
export const importRateLimiter = new RateLimiter(5, 60 * 60 * 1000) // 5 imports per hour
export const exportRateLimiter = new RateLimiter(10, 60 * 60 * 1000) // 10 exports per hour

// Cleanup expired entries every 5 minutes
setInterval(
  () => {
    generalRateLimiter.cleanup()
    importRateLimiter.cleanup()
    exportRateLimiter.cleanup()
  },
  5 * 60 * 1000,
)

export function checkRateLimit(
  identifier: string,
  limiter: RateLimiter = generalRateLimiter,
): { allowed: boolean; remaining: number; resetTime: number } {
  const allowed = limiter.isAllowed(identifier)
  const remaining = limiter.getRemainingRequests(identifier)
  const resetTime = limiter.getResetTime(identifier)

  return { allowed, remaining, resetTime }
}
