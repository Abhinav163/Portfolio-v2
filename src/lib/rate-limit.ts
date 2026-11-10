type Bucket = { hits: number[] };

const buckets = new Map<string, Bucket>();

/**
 * Sliding-window limiter kept in memory. On serverless hosts each instance has
 * its own memory, so this is a best-effort brake on spam, not a guarantee.
 */
export function rateLimit(key: string, { limit = 5, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const retryAfterMs = windowMs - (now - bucket.hits[0]);
    return { ok: false as const, retryAfter: Math.ceil(retryAfterMs / 1000) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  if (buckets.size > 5000) {
    for (const [storedKey, stored] of buckets) {
      if (stored.hits.every((time) => now - time >= windowMs)) buckets.delete(storedKey);
    }
  }

  return { ok: true as const, retryAfter: 0 };
}
