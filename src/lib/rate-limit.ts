interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
let lastCleanup = 0;

function cleanup(now: number, windowMs: number): void {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((time) => time > now - windowMs);
    if (!bucket.hits.length) buckets.delete(key);
  }
}

/** Simple in-process limiter to protect free external services from runaway usage. */
export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  cleanup(now, windowMs);
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((time) => time > now - windowMs);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((bucket.hits[0] + windowMs - now) / 1000) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 };
}

/** Prefer the platform-provided IP; the first forwarded value can be client-controlled. */
export function requestKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return forwarded?.at(-1) ?? "local";
}
