type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 7;

function cleanupExpired(now: number) {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function consumeLoginAttempt(ip: string) {
  const now = Date.now();
  cleanupExpired(now);

  const bucket = buckets.get(ip);
  if (!bucket) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true as const, retryAfterSec: 0 };
  }

  if (bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true as const, retryAfterSec: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false as const,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  buckets.set(ip, bucket);
  return { allowed: true as const, retryAfterSec: 0 };
}
